import asyncHandler from "express-async-handler";
import Member from "../models/Member.js";
import { isMongoConnected, localMembers } from "../utils/localDb.js";

// @desc    Get all members with filters and pagination
// @route   GET /api/members
// @access  Public
export const getMembers = asyncHandler(async (req, res) => {
  const search = req.query.search || "";
  const active = req.query.active || ""; // "true" or "false"
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!isMongoConnected()) {
    const list = localMembers.find({}, search, active);
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
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (active === "true") {
      query.isActive = true;
    } else if (active === "false") {
      query.isActive = false;
    }

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  }
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Public
export const getMemberById = asyncHandler(async (req, res) => {
  const memberId = req.params.id;

  if (!isMongoConnected()) {
    const member = localMembers.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }
    res.json({ success: true, data: member });
  } else {
    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }
    res.json({ success: true, data: member });
  }
});

// @desc    Create a new member
// @route   POST /api/members
// @access  Public
export const createMember = asyncHandler(async (req, res) => {
  const { name, email, phone, membershipType } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error("Name and Email are required");
  }

  if (!isMongoConnected()) {
    // Check local emails
    const existing = localMembers.get().find(m => m.email === email.toLowerCase());
    if (existing) {
      res.status(400);
      throw new Error("A subscriber with this email already exists");
    }

    const newMember = localMembers.create({ name, email, phone, membershipType });
    res.status(201).json({ success: true, data: newMember });
  } else {
    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      res.status(400);
      throw new Error("A subscriber with this email already exists");
    }

    const newMember = await Member.create({
      name,
      email,
      phone,
      membershipType,
    });

    res.status(201).json({ success: true, data: newMember });
  }
});

// @desc    Update member details
// @route   PUT /api/members/:id
// @access  Public
export const updateMember = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const updateData = req.body;

  if (!isMongoConnected()) {
    const updated = localMembers.update(memberId, updateData);
    if (!updated) {
      res.status(404);
      throw new Error("Member not found");
    }
    res.json({ success: true, data: updated });
  } else {
    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }

    // Check unique email if modified
    if (updateData.email && updateData.email.toLowerCase() !== member.email) {
      const emailTaken = await Member.findOne({ email: updateData.email.toLowerCase() });
      if (emailTaken) {
         res.status(400);
         throw new Error("A subscriber with this email already exists");
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(memberId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updatedMember });
  }
});

// @desc    Deactivate a member (Soft delete)
// @route   DELETE /api/members/:id
// @access  Public
export const deleteMember = asyncHandler(async (req, res) => {
  const memberId = req.params.id;

  if (!isMongoConnected()) {
    const updated = localMembers.delete(memberId);
    if (!updated) {
      res.status(404);
      throw new Error("Member not found");
    }
    res.json({ success: true, message: "Member deactivated successfully", data: updated });
  } else {
    const member = await Member.findById(memberId);
    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }

    member.isActive = false;
    await member.save();

    res.json({ success: true, message: "Member deactivated successfully", data: member });
  }
});
