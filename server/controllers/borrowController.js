import asyncHandler from "express-async-handler";
import BorrowRecord from "../models/BorrowRecord.js";
import Book from "../models/Book.js";
import Member from "../models/Member.js";
import { isMongoConnected, localBooks, localMembers, localRecords } from "../utils/localDb.js";

// Helper to update overdue books
const autoUpdateOverdue = async () => {
  const today = new Date();
  
  if (!isMongoConnected()) {
    // Handled natively inside localRecords.find(), but we make sure of it here
    const list = localRecords.get();
    let updated = false;
    const modified = list.map(r => {
      if (r.status === "borrowed" && new Date(r.dueDate) < today) {
        updated = true;
        return { ...r, status: "overdue" };
      }
      return r;
    });
    if (updated) {
      localRecords.save(modified);
    }
  } else {
    await BorrowRecord.updateMany(
      {
        status: "borrowed",
        dueDate: { $lt: today },
      },
      {
        $set: { status: "overdue" },
      }
    );
  }
};

// @desc    Get all borrow records (Filtered and Paginated)
// @route   GET /api/borrow
// @access  Public
export const getBorrowRecords = asyncHandler(async (req, res) => {
  await autoUpdateOverdue();

  const status = req.query.status || "";
  const memberId = req.query.memberId || "";
  const bookId = req.query.bookId || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!isMongoConnected()) {
    const list = localRecords.find({}, status, memberId, bookId);
    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } else {
    const query = {};

    if (status) {
      query.status = status;
    }
    if (memberId) {
      query.member = memberId;
    }
    if (bookId) {
      query.book = bookId;
    }

    const total = await BorrowRecord.countDocuments(query);
    const records = await BorrowRecord.find(query)
      .populate("book")
      .populate("member")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  }
});

// @desc    Get all overdue records
// @route   GET /api/borrow/overdue
// @access  Public
export const getOverdueRecords = asyncHandler(async (req, res) => {
  await autoUpdateOverdue();

  if (!isMongoConnected()) {
    const overdue = localRecords.find({}).filter(r => r.status === "overdue");
    res.json({ success: true, data: overdue });
  } else {
    const overdue = await BorrowRecord.find({ status: "overdue" })
      .populate("book")
      .populate("member")
      .sort({ dueDate: 1 });
      
    res.json({ success: true, data: overdue });
  }
});

// @desc    Borrow a book
// @route   POST /api/borrow/borrow
// @access  Public
export const borrowBook = asyncHandler(async (req, res) => {
  const { bookId, memberId, dueDate } = req.body;

  if (!bookId || !memberId) {
    res.status(400);
    throw new Error("Book ID and Member ID are required");
  }

  if (!isMongoConnected()) {
    const book = localBooks.findById(bookId);
    const member = localMembers.findById(memberId);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }

    if (book.availableCopies === 0) {
      res.status(400);
      throw new Error("This book is currently out of stock!");
    }

    if (!member.isActive) {
      res.status(400);
      throw new Error("Membership is inactive. Cannot borrow.");
    }

    // Check duplicate active borrow
    const alreadyBorrowed = localRecords.get().some(
      r => r.book === bookId && r.member === memberId && r.status !== "returned"
    );

    if (alreadyBorrowed) {
      res.status(400);
      throw new Error("Member has already borrowed this book and not returned it yet!");
    }

    // Process Borrow
    const newRecord = localRecords.create({ book: bookId, member: memberId, dueDate });
    localBooks.update(bookId, { availableCopies: book.availableCopies - 1 });

    res.status(201).json({ success: true, data: newRecord });
  } else {
    const book = await Book.findById(bookId);
    const member = await Member.findById(memberId);

    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }

    if (book.availableCopies === 0) {
      res.status(400);
      throw new Error("This book is currently out of stock!");
    }

    if (!member.isActive) {
      res.status(400);
      throw new Error("Membership is inactive. Cannot borrow.");
    }

    // Check duplicate active borrow
    const existingBorrow = await BorrowRecord.findOne({
      book: bookId,
      member: memberId,
      status: { $ne: "returned" },
    });

    if (existingBorrow) {
      res.status(400);
      throw new Error("Member has already borrowed this book and not returned it yet!");
    }

    // Update copies and create record
    book.availableCopies -= 1;
    await book.save();

    const record = await BorrowRecord.create({
      book: bookId,
      member: memberId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "borrowed",
    });

    res.status(201).json({ success: true, data: record });
  }
});

// @desc    Return a borrowed book
// @route   PUT /api/borrow/return/:id
// @access  Public
export const returnBook = asyncHandler(async (req, res) => {
  const recordId = req.params.id;

  if (!isMongoConnected()) {
    const record = localRecords.findById(recordId);
    if (!record) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    if (record.status === "returned") {
      res.status(400);
      throw new Error("This record indicates the book was already returned!");
    }

    // Calculate Dues and Fines
    const today = new Date();
    const due = new Date(record.dueDate);
    let fine = 0;

    if (today > due) {
      const msDiff = today.getTime() - due.getTime();
      const overdueDays = Math.ceil(msDiff / (1000 * 3600 * 24));
      fine = overdueDays * 5;
    }

    // Update Record and Book copies
    localRecords.update(recordId, {
      returnDate: today.toISOString(),
      status: "returned",
      fine,
    });

    const book = localBooks.findById(record.book._id);
    if (book) {
      localBooks.update(book._id, { availableCopies: book.availableCopies + 1 });
    }

    res.json({
      success: true,
      message: "Book returned successfully",
      data: { ...record, status: "returned", returnDate: today, fine }
    });
  } else {
    const record = await BorrowRecord.findById(recordId);
    if (!record) {
      res.status(404);
      throw new Error("Borrow record not found");
    }

    if (record.status === "returned") {
      res.status(400);
      throw new Error("This record indicates the book was already returned!");
    }

    // Calculate Dues and Fines
    const today = new Date();
    const due = new Date(record.dueDate);
    let fine = 0;

    if (today > due) {
      const msDiff = today.getTime() - due.getTime();
      const overdueDays = Math.ceil(msDiff / (1000 * 3600 * 24));
      fine = overdueDays * 5;
    }

    // Update Borrow Record
    record.returnDate = today;
    record.status = "returned";
    record.fine = fine;
    await record.save();

    // Increment available copies
    const book = await Book.findById(record.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({
      success: true,
      message: "Book returned successfully",
      data: record,
    });
  }
});

// @desc    Get borrow history for a member
// @route   GET /api/borrow/history/:memberId
// @access  Public
export const getMemberBorrowHistory = asyncHandler(async (req, res) => {
  const memberId = req.params.memberId;

  if (!isMongoConnected()) {
    const history = localRecords.find({}).filter(r => r.member._id === memberId);
    // Sort newest first
    const sorted = [...history].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
    res.json({ success: true, data: sorted });
  } else {
    const history = await BorrowRecord.find({ member: memberId })
      .populate("book")
      .populate("member")
      .sort({ borrowDate: -1 });

    res.json({ success: true, data: history });
  }
});
