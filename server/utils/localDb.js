import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const DATA_DIR = path.join(process.cwd(), "server", "data");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const BOOKS_FILE = path.join(DATA_DIR, "books.json");
const MEMBERS_FILE = path.join(DATA_DIR, "members.json");
const RECORDS_FILE = path.join(DATA_DIR, "borrow_records.json");

const loadJSON = (filePath, defaultVal = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error loading file ${filePath}:`, err);
  }
  return defaultVal;
};

const saveJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving file ${filePath}:`, err);
  }
};

// Check if MongoDB is connected
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// --- BOOKS FALLBACK ---
export const localBooks = {
  get: () => loadJSON(BOOKS_FILE),
  save: (data) => saveJSON(BOOKS_FILE, data),
  find: (query = {}, search = "", genre = "") => {
    let list = localBooks.get();
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(term) || 
        b.author.toLowerCase().includes(term)
      );
    }
    if (genre) {
      list = list.filter(b => b.genre && b.genre.toLowerCase() === genre.toLowerCase());
    }
    return list;
  },
  findById: (id) => {
    return localBooks.get().find(b => b._id === id);
  },
  create: (bookData) => {
    const list = localBooks.get();
    const newBook = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn || "",
      genre: bookData.genre || "Unknown",
      description: bookData.description || "",
      coverImage: bookData.coverImage || "",
      totalCopies: Number(bookData.totalCopies || 1),
      availableCopies: Number(bookData.totalCopies || 1),
      publishedYear: Number(bookData.publishedYear) || null,
      publisher: bookData.publisher || "",
      language: bookData.language || "English",
      pages: Number(bookData.pages) || null,
      tags: Array.isArray(bookData.tags) ? bookData.tags : (bookData.tags ? bookData.tags.split(",").map(t => t.trim()) : []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newBook);
    localBooks.save(list);
    return newBook;
  },
  update: (id, updateData) => {
    const list = localBooks.get();
    const idx = list.findIndex(b => b._id === id);
    if (idx === -1) return null;
    const original = list[idx];
    
    // Calculate copies change
    let totalCopies = typeof updateData.totalCopies !== 'undefined' ? Number(updateData.totalCopies) : original.totalCopies;
    let copiesDiff = totalCopies - original.totalCopies;
    let availableCopies = typeof updateData.availableCopies !== 'undefined' ? Number(updateData.availableCopies) : original.availableCopies + copiesDiff;
    if (availableCopies < 0) availableCopies = 0;

    const updated = {
      ...original,
      ...updateData,
      totalCopies,
      availableCopies,
      tags: Array.isArray(updateData.tags) ? updateData.tags : (typeof updateData.tags === 'string' ? updateData.tags.split(",").map(t => t.trim()) : original.tags),
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    localBooks.save(list);
    return updated;
  },
  delete: (id) => {
    const list = localBooks.get();
    const filtered = list.filter(b => b._id !== id);
    localBooks.save(filtered);
    return true;
  }
};

// --- MEMBERS FALLBACK ---
export const localMembers = {
  get: () => loadJSON(MEMBERS_FILE),
  save: (data) => saveJSON(MEMBERS_FILE, data),
  find: (query = {}, search = "", active = "") => {
    let list = localMembers.get();
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.email.toLowerCase().includes(term)
      );
    }
    if (active === "true") {
      list = list.filter(m => m.isActive === true);
    } else if (active === "false") {
      list = list.filter(m => m.isActive === false);
    }
    return list;
  },
  findById: (id) => {
    return localMembers.get().find(m => m._id === id);
  },
  create: (memberData) => {
    const list = localMembers.get();
    const newMember = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: memberData.name,
      email: memberData.email.toLowerCase(),
      phone: memberData.phone || "",
      membershipId: "LIB-" + Date.now(),
      membershipType: memberData.membershipType || "basic",
      joinDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newMember);
    localMembers.save(list);
    return newMember;
  },
  update: (id, updateData) => {
    const list = localMembers.get();
    const idx = list.findIndex(m => m._id === id);
    if (idx === -1) return null;
    const updated = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    localMembers.save(list);
    return updated;
  },
  delete: (id) => {
    // Soft delete: set isActive = false
    return localMembers.update(id, { isActive: false });
  }
};

// --- BORROW RECORDS FALLBACK ---
export const localRecords = {
  get: () => loadJSON(RECORDS_FILE),
  save: (data) => saveJSON(RECORDS_FILE, data),
  find: (query = {}, status = "", memberId = "", bookId = "") => {
    let list = localRecords.get();
    
    // Auto-update overdue status first
    const today = new Date();
    let changed = false;
    list = list.map(r => {
      if (r.status === "borrowed" && new Date(r.dueDate) < today) {
        changed = true;
        return { ...r, status: "overdue" };
      }
      return r;
    });
    if (changed) {
      saveJSON(RECORDS_FILE, list);
    }

    if (status) {
      list = list.filter(r => r.status === status);
    }
    if (memberId) {
      list = list.filter(r => r.member === memberId);
    }
    if (bookId) {
      list = list.filter(r => r.book === bookId);
    }

    // Populate books and members
    const books = localBooks.get();
    const members = localMembers.get();

    return list.map(record => ({
      ...record,
      book: books.find(b => b._id === record.book) || { title: "Deleted Book", _id: record.book },
      member: members.find(m => m._id === record.member) || { name: "Deleted Member", _id: record.member }
    }));
  },
  findById: (id) => {
    const r = localRecords.get().find(rec => rec._id === id);
    if (!r) return null;
    const book = localBooks.get().find(b => b._id === r.book) || null;
    const member = localMembers.get().find(m => m._id === r.member) || null;
    return { ...r, book, member };
  },
  create: (recData) => {
    const list = localRecords.get();
    const today = new Date();
    const defaultDue = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const newRecord = {
      _id: new mongoose.Types.ObjectId().toString(),
      book: recData.book,
      member: recData.member,
      borrowDate: today.toISOString(),
      dueDate: recData.dueDate ? new Date(recData.dueDate).toISOString() : defaultDue.toISOString(),
      returnDate: null,
      status: "borrowed",
      fine: 0,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString()
    };
    list.push(newRecord);
    localRecords.save(list);
    return newRecord;
  },
  update: (id, updateData) => {
    const list = localRecords.get();
    const idx = list.findIndex(r => r._id === id);
    if (idx === -1) return null;
    const updated = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    localRecords.save(list);
    return updated;
  }
};
