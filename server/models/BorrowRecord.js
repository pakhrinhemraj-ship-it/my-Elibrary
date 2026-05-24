import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
    fine: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BorrowRecord = mongoose.model("BorrowRecord", borrowRecordSchema);

export default BorrowRecord;
