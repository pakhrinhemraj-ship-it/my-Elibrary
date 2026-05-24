import React, { useState, useEffect } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useMembers } from "../hooks/useMembers.js";

export default function MemberFormModal() {
  const { 
    activeMemberToEdit, 
    isMemberModalOpen, 
    closeMemberFormModal 
  } = useLibrary();

  const { createMember, updateMember, loading } = useMembers();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "standard",
    active: true
  });

  // Hydrate fields if editing profile details
  useEffect(() => {
    if (isMemberModalOpen && activeMemberToEdit) {
      setFormData({
        name: activeMemberToEdit.name || "",
        email: activeMemberToEdit.email || "",
        phone: activeMemberToEdit.phone || "",
        membershipType: activeMemberToEdit.membershipType || "standard",
        active: activeMemberToEdit.active !== false
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        membershipType: "standard",
        active: true
      });
    }
  }, [isMemberModalOpen, activeMemberToEdit]);

  if (!isMemberModalOpen) return null;

  const isEditMode = !!activeMemberToEdit;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateMember(activeMemberToEdit._id, formData);
      } else {
        await createMember(formData);
      }
      closeMemberFormModal();
    } catch (err) {
      // errors handled in hook toast alerts globally
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background shade */}
      <div 
        onClick={closeMemberFormModal} 
        className="absolute inset-0 bg-base/80 backdrop-blur-md"
      ></div>

      {/* Glassmorphic profile modal panel */}
      <div className="glass-card max-w-md w-full p-6 border border-cyan/30 z-10 animate-fade-in relative shadow-[0_0_35px_rgba(0,245,255,0.15)] bg-surface/90">
        <button
          onClick={closeMemberFormModal}
          className="absolute top-4 right-4 text-muted hover:text-cyan transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-orbitron font-bold text-lg text-white mb-1 tracking-wider uppercase">
          {isEditMode ? "EDIT SUBSCRIBER PROFILE" : "REGISTER NEW SUBSCRIBER"}
        </h3>
        <p className="font-outfit text-xs text-muted mb-5 border-b border-cyan/15 pb-3">
          Configure subscriber personal folders, contact details, and levels.
        </p>

        {/* Configurations input grid form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Full Name Name *</label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Hemraj Pakhrin"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Contact Email identifier */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Contact Email *</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. subscriber@domain.com"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Contact Mobile Number */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Contact Mobile Phone *</label>
            <input
              type="tel"
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +977-98XXXXXXXX"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-mono text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Membership Tier selections list */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Membership Tier *</label>
            <select
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            >
              <option value="standard">Standard Level (Limit: 3 Active books Checkout)</option>
              <option value="premium">Premium Level (Unlimited Active Checkouts)</option>
            </select>
          </div>

          {/* Membership activation togglers (for edit mode only) */}
          {isEditMode && (
            <div className="flex items-center space-x-3 bg-surface/40 p-3 rounded-xl border border-cyan/10">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 bg-surface rounded border-cyan/15 text-cyan focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="active" className="font-outfit text-xs text-text font-semibold uppercase tracking-wider cursor-pointer">
                Membership Active Status
              </label>
            </div>
          )}

          {/* Submitting commands */}
          <div className="pt-3 flex items-center justify-end space-x-3.5">
            <button
              type="button"
              onClick={closeMemberFormModal}
              className="px-4 py-2 bg-surface border border-cyan/10 hover:bg-surface/70 text-xs font-semibold rounded-lg uppercase tracking-wide cursor-pointer text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg uppercase tracking-wide neon-btn-cyan cursor-pointer flex items-center space-x-1.5"
            >
              {isEditMode ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              <span>{loading ? "Processing..." : isEditMode ? "Update Profile" : "Register Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
