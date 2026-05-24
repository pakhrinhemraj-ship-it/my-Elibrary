import React, { useState, useEffect } from "react";
import { X, UserCheck, HelpCircle } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useBorrow } from "../hooks/useBorrow.js";

export default function BorrowModal() {
  const { 
    selectedBookForBorrow, 
    isBorrowModalOpen, 
    closeBorrowModal, 
    members, 
    fetchMembers 
  } = useLibrary();

  const { borrowBook, loading } = useBorrow();

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [dueDateStr, setDueDateStr] = useState("");

  // Default due date calculation (+14 days)
  useEffect(() => {
    if (isBorrowModalOpen) {
      fetchMembers({ active: "true", limit: 100 }); // fetch active members list
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDateStr(d.toISOString().split("T")[0]); // formatted as standard YYYY-MM-DD
    }
  }, [isBorrowModalOpen, fetchMembers]);

  if (!isBorrowModalOpen || !selectedBookForBorrow) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      await borrowBook({
        bookId: selectedBookForBorrow._id,
        memberId: selectedMemberId,
        dueDate: new Date(dueDateStr).toISOString(),
      });
      closeBorrowModal();
      setSelectedMemberId("");
    } catch (err) {
      // Errors are already handled by custom toast messages inside useBorrow hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute Backdrop Layer */}
      <div 
        onClick={closeBorrowModal} 
        className="absolute inset-0 bg-base/80 backdrop-blur-md"
      ></div>

      {/* Main Glassmorphic Modal Block */}
      <div className="glass-card max-w-md w-full p-6 border border-cyan/30 z-10 animate-fade-in relative shadow-[0_0_35px_rgba(0,245,255,0.15)] bg-surface/90">
        <button
          onClick={closeBorrowModal}
          className="absolute top-4 right-4 text-muted hover:text-cyan transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-orbitron font-bold text-lg text-white mb-1 tracking-wider uppercase">
          CIRCULATION ISSUE
        </h3>
        <p className="font-outfit text-xs text-muted mb-5 border-b border-cyan/15 pb-3">
          Match and checkout a book to an active registered subscriber.
        </p>

        {/* Selected Book Profile Preview */}
        <div className="flex bg-base/50 p-3 rounded-xl border border-cyan/10 items-center space-x-3 mb-5">
          <img
            src={selectedBookForBorrow.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"}
            alt={selectedBookForBorrow.title}
            referrerPolicy="no-referrer"
            className="h-16 w-12 object-cover rounded-lg border border-cyan/10"
          />
          <div>
            <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-semibold">Ready to Borrow</span>
            <h4 className="font-orbitron text-xs font-bold text-white leading-normal mt-0.5 line-clamp-1">{selectedBookForBorrow.title}</h4>
            <span className="font-outfit text-[11px] text-muted">Author: {selectedBookForBorrow.author}</span>
          </div>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member lookup matching select tool */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">SELECT SUBSCRIBER:</label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-surface/80 border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            >
              <option value="">-- Choose registered subscriber --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.membershipId} - {m.membershipType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker calibration */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">RETURNING DUE DATE:</label>
            <input
              required
              type="date"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
              className="w-full bg-surface/80 border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-mono text-text focus:outline-none focus:border-cyan/40"
            />
            <span className="text-[10px] text-muted font-outfit flex items-center gap-1">
              <HelpCircle className="h-3 w-3 text-cyan" /> Suggested default checkout limit is 14 days.
            </span>
          </div>

          {/* Submitting buttons trigger */}
          <div className="pt-3 flex items-center justify-end space-x-3.5">
            <button
              type="button"
              onClick={closeBorrowModal}
              className="px-4 py-2 bg-surface border border-cyan/10 hover:bg-surface/70 text-xs font-semibold rounded-lg uppercase tracking-wide cursor-pointer text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMemberId}
              className="px-4 py-2 text-xs font-semibold rounded-lg uppercase tracking-wide neon-btn-cyan cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>{loading ? "Checking out..." : "Checkout Book"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
