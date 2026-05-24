import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertOctagon, HelpCircle, Receipt } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useBorrow } from "../hooks/useBorrow.js";

export default function ReturnModal() {
  const { 
    selectedRecordForReturn, 
    isReturnModalOpen, 
    closeReturnModal 
  } = useLibrary();

  const { returnBook, loading } = useBorrow();

  const [estimatedFine, setEstimatedFine] = useState(0);
  const [overdueDays, setOverdueDays] = useState(0);

  useEffect(() => {
    if (isReturnModalOpen && selectedRecordForReturn) {
      // Calculate estimated overdue delays and fines
      const today = new Date();
      const due = new Date(selectedRecordForReturn.dueDate);
      if (today > due) {
        const diffMs = today.getTime() - due.getTime();
        const days = Math.ceil(diffMs / (1000 * 3600 * 24));
        setOverdueDays(days);
        setEstimatedFine(days * 5); // Rs. 5 per day standard charging tariff
      } else {
        setOverdueDays(0);
        setEstimatedFine(0);
      }
    }
  }, [isReturnModalOpen, selectedRecordForReturn]);

  if (!isReturnModalOpen || !selectedRecordForReturn) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await returnBook(selectedRecordForReturn._id);
      closeReturnModal();
    } catch (err) {
      // Handled inside useBorrow hook internally
    }
  };

  const isOverdue = overdueDays > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background shade */}
      <div 
        onClick={closeReturnModal} 
        className="absolute inset-0 bg-base/80 backdrop-blur-md"
      ></div>

      {/* Glassmorphic returning modal structure */}
      <div className="glass-card max-w-md w-full p-6 border border-cyan/30 z-10 animate-fade-in relative shadow-[0_0_35px_rgba(0,245,255,0.15)] bg-surface/90">
        <button
          onClick={closeReturnModal}
          className="absolute top-4 right-4 text-muted hover:text-cyan transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-orbitron font-bold text-lg text-white mb-1 tracking-wider uppercase">
          CIRCULATION RETURNS
        </h3>
        <p className="font-outfit text-xs text-muted mb-5 border-b border-cyan/15 pb-3">
          Process returning copies back to physical book stock catalog folders.
        </p>

        {/* Selected book previews */}
        <div className="space-y-4 mb-5">
          <div className="flex bg-base/50 p-3 rounded-xl border border-cyan/10 items-center space-x-3">
            <img
              src={selectedRecordForReturn.book?.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"}
              alt={selectedRecordForReturn.book?.title}
              referrerPolicy="no-referrer"
              className="h-16 w-12 object-cover rounded-lg border border-cyan/10"
            />
            <div>
              <span className="font-mono text-[9px] text-[#8b5cf6] uppercase tracking-widest font-semibold">Active Checkout</span>
              <h4 className="font-orbitron text-xs font-bold text-white leading-normal mt-0.5 line-clamp-1">{selectedRecordForReturn.book?.title}</h4>
              <span className="font-outfit text-[11px] text-muted">Issued to Subscriber: {selectedRecordForReturn.member?.name}</span>
            </div>
          </div>

          {/* Date Information Grid summaries */}
          <div className="grid grid-cols-2 gap-3.5 bg-surface/30 p-3 rounded-xl border border-cyan/5 text-xs">
            <div>
              <span className="block text-muted font-mono text-[10px] uppercase">Checkout date:</span>
              <p className="font-outfit text-text font-medium mt-0.5">
                {new Date(selectedRecordForReturn.borrowDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="block text-muted font-mono text-[10px] uppercase font-semibold">Due date:</span>
              <p className={`font-outfit font-semibold mt-0.5 ${isOverdue ? "text-red" : "text-cyan"}`}>
                {new Date(selectedRecordForReturn.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Fines analysis notification warning panel */}
          {isOverdue ? (
            <div className="bg-red/10 border border-red/30 p-3.5 rounded-xl space-y-1.5 animate-pulse">
              <div className="flex items-center space-x-2 text-xs text-red font-bold">
                <AlertOctagon className="h-4 w-4" />
                <span className="font-orbitron tracking-wide">OVERDUE CIRCLINGS PENALTY</span>
              </div>
              <p className="font-outfit text-[11px] text-text/80 leading-normal">
                This item is return-overdue by <span className="font-bold text-red">{overdueDays} days</span>. A mandatory charging tariff fee details:
              </p>
              <div className="flex items-center justify-between border-t border-red/10 pt-2 text-xs font-mono font-bold text-red">
                <span>TOTAL FINE CHARGED:</span>
                <span>Rs. {estimatedFine}.00</span>
              </div>
            </div>
          ) : (
            <div className="bg-green/10 border border-green/35 p-3 rounded-xl flex items-center space-x-2.5 text-green text-xs font-outfit">
              <CheckCircle className="h-5 w-5" />
              <span>Great news! Return is on-schedule. No fine dues pending.</span>
            </div>
          )}
        </div>

        {/* Submitting Actions */}
        <form onSubmit={handleSubmit} className="pt-3 flex items-center justify-end space-x-3.5">
          <button
            type="button"
            onClick={closeReturnModal}
            className="px-4 py-2 bg-surface border border-cyan/10 hover:bg-surface/70 text-xs font-semibold rounded-lg uppercase tracking-wide cursor-pointer text-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg uppercase tracking-wide neon-btn-violet cursor-pointer flex items-center space-x-1.5"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>{loading ? "Returning..." : "Process Return"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
