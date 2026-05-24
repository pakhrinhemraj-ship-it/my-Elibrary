import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Total copies cannot be less than 1"],
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1,
      min: [0, "Available copies cannot be less than 0"],
    },
    publishedYear: {
      type: Number,
    },
    publisher: {
      type: String,
    },
    language: {
      type: String,
      default: "English",
    },
    pages: {
      type: Number,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Search index helper
bookSchema.index({ title: "text", author: "text" });

const Book = mongoose.model("Book", bookSchema);

export default Book;
