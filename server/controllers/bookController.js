import asyncHandler from "express-async-handler";
import Book from "../models/Book.js";
import Member from "../models/Member.js";
import BorrowRecord from "../models/BorrowRecord.js";
import { isMongoConnected, localBooks, localMembers, localRecords } from "../utils/localDb.js";

// @desc    Get book statistics
// @route   GET /api/books/stats/summary
// @access  Public
export const getBookStats = asyncHandler(async (req, res) => {
  if (!isMongoConnected()) {
    // --- Local Fallback Calculations ---
    const books = localBooks.get();
    const members = localMembers.get();
    const records = localRecords.get();

    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0);
    const totalAvailable = books.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0);
    const totalBorrowed = records.filter(r => r.status === "borrowed").length;
    
    // Auto calculate and filter overdue
    const today = new Date();
    const totalOverdue = records.filter(r => r.status === "overdue" || (r.status === "borrowed" && new Date(r.dueDate) < today)).length;
    const totalMembers = members.filter(m => m.isActive).length;

    // Genres counting
    const genreMap = {};
    books.forEach(b => {
      const g = b.genre || "Unassigned";
      genreMap[g] = (genreMap[g] || 0) + 1;
    });
    const genres = Object.keys(genreMap).map(g => ({ genre: g, count: genreMap[g] }));

    // Recent borrows (last 5)
    // Populate records manually for local
    const sortedRecords = [...records]
      .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
      .slice(0, 5)
      .map(r => {
        const bk = books.find(b => b._id === r.book) || { title: "Unknown Book" };
        const mb = members.find(m => m._id === r.member) || { name: "Unknown Member" };
        return {
          ...r,
          book: bk,
          member: mb
        };
      });

    // Borrow activity 7 days
    const activityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      activityMap[dateStr] = 0;
    }

    records.forEach(r => {
      const bDate = r.borrowDate.split("T")[0];
      if (activityMap[bDate] !== undefined) {
        activityMap[bDate] += 1;
      }
    });

    const borrowActivity7Days = Object.keys(activityMap).map(d => ({
      date: d,
      count: activityMap[d]
    }));

    res.json({
      success: true,
      data: {
        totalBooks,
        totalCopies,
        totalAvailable,
        totalBorrowed,
        totalOverdue,
        totalMembers,
        genres,
        recentBorrows: sortedRecords,
        borrowActivity7Days
      }
    });
  } else {
    // --- MongoDB Mongoose Operations ---
    const totalBooks = await Book.countDocuments();
    
    const copiesStats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: "$totalCopies" },
          totalAvailable: { $sum: "$availableCopies" }
        }
      }
    ]);

    const totalCopies = copiesStats[0]?.totalCopies || 0;
    const totalAvailable = copiesStats[0]?.totalAvailable || 0;

    const totalBorrowed = await BorrowRecord.countDocuments({ status: "borrowed" });
    const totalOverdue = await BorrowRecord.countDocuments({ status: "overdue" });
    const totalMembers = await Member.countDocuments({ isActive: true });

    const genreStats = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $project: { genre: { $ifNull: ["$_id", "Unassigned"] }, count: 1, _id: 0 } }
    ]);

    const recentBorrows = await BorrowRecord.find()
      .populate("book", "title coverImage")
      .populate("member", "name email membershipId")
      .sort({ borrowDate: -1 })
      .limit(5);

    // 7 Days Borrow Activity aggregation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activityData = await BorrowRecord.aggregate([
      { $match: { borrowDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$borrowDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const activityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      activityMap[dateStr] = 0;
    }

    activityData.forEach(item => {
      activityMap[item._id] = item.count;
    });

    const borrowActivity7Days = Object.keys(activityMap).map(dateKey => ({
      date: dateKey,
      count: activityMap[dateKey]
    }));

    res.json({
      success: true,
      data: {
        totalBooks,
        totalCopies,
        totalAvailable,
        totalBorrowed,
        totalOverdue,
        totalMembers,
        genres: genreStats,
        recentBorrows,
        borrowActivity7Days
      }
    });
  }
});

// @desc    Get all books (Searching & Pagination)
// @route   GET /api/books
// @access  Public
export const getBooks = asyncHandler(async (req, res) => {
  const search = req.query.search || "";
  const genre = req.query.genre || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!isMongoConnected()) {
    const list = localBooks.find({}, search, genre);
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
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    if (genre) {
      query.genre = { $regex: `^${genre}$`, $options: "i" };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  }
});

// @desc    Get a book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = asyncHandler(async (req, res) => {
  const bookId = req.params.id;

  if (!isMongoConnected()) {
    const book = localBooks.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }
    res.json({ success: true, data: book });
  } else {
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }
    res.json({ success: true, data: book });
  }
});

// @desc    Create a new book
// @route   POST /api/books
// @access  Public
export const createBook = asyncHandler(async (req, res) => {
  const bookData = req.body;

  if (!isMongoConnected()) {
    const newBook = localBooks.create(bookData);
    res.status(201).json({ success: true, data: newBook });
  } else {
    // Fill availableCopies with totalCopies initially
    bookData.availableCopies = bookData.totalCopies || 1;
    
    if (typeof bookData.tags === "string") {
      bookData.tags = bookData.tags.split(",").map(t => t.trim());
    }

    const newBook = await Book.create(bookData);
    res.status(201).json({ success: true, data: newBook });
  }
});

// @desc    Update an existing book
// @route   PUT /api/books/:id
// @access  Public
export const updateBook = asyncHandler(async (req, res) => {
  const bookId = req.params.id;
  const updateData = req.body;

  if (!isMongoConnected()) {
    const updated = localBooks.update(bookId, updateData);
    if (!updated) {
      res.status(404);
      throw new Error("Book not found");
    }
    res.json({ success: true, data: updated });
  } else {
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    // Keep copies consistent
    if (updateData.totalCopies !== undefined) {
      const diff = Number(updateData.totalCopies) - book.totalCopies;
      updateData.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map(t => t.trim());
    }

    const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updatedBook });
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Public
export const deleteBook = asyncHandler(async (req, res) => {
  const bookId = req.params.id;

  if (!isMongoConnected()) {
    // Check local borrows
    const records = localRecords.get();
    const hasActiveBorrows = records.some(r => r.book === bookId && r.status === "borrowed");
    
    if (hasActiveBorrows) {
      res.status(400);
      throw new Error("Cannot delete book with active borrows");
    }

    localBooks.delete(bookId);
    res.json({ success: true, message: "Book deleted successfully" });
  } else {
    // Check active borrows
    const activeBorrows = await BorrowRecord.countDocuments({
      book: bookId,
      status: "borrowed"
    });

    if (activeBorrows > 0) {
      res.status(400);
      throw new Error("Cannot delete book with active borrows");
    }

    const book = await Book.findByIdAndDelete(bookId);
    if (!book) {
      res.status(404);
      throw new Error("Book not found");
    }

    res.json({ success: true, message: "Book deleted successfully" });
  }
});
