import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    membershipId: {
      type: String,
      unique: true,
      default: () => "LIB-" + Date.now(),
    },
    membershipType: {
      type: String,
      enum: ["basic", "premium", "student"],
      default: "basic",
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search index helper
memberSchema.index({ name: "text", email: "text" });

const Member = mongoose.model("Member", memberSchema);

export default Member;
