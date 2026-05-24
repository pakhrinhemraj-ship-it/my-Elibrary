import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Edit3, Trash2, Library, BookOpen, AlertCircle, Bookmark, Sparkles, X } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import api from "../api/axios.js";

export default function BookCard({ book, onDelete }) {
  const { triggerBorrowModal } = useLibrary();
  const cardRef = useRef(null);

  // States for 3D tilt effects
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
    transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
  });

  // State for immediate delete confirmation prompt
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // State for AI Book Synopsis Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchAiSummary = async () => {
    setIsAiModalOpen(true);
    if (aiSummary) return; // cache hit
    setLoadingAi(true);
    try {
      const response = await api.post("/ai/summarize-book", {
        title: book.title,
        author: book.author,
        description: book.description
      });
      if (response.success && response.data) {
        setAiSummary(response.data);
      } else {
        throw new Error();
      }
    } catch (err) {
      setAiSummary("⚠️ CyberLibrarian was unable to analyze this asset's metadata profile. Verify AI connections and try again.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Tracker for 3D mouse moves
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    // Calculate normalized coords (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    // Rotate bounds: max 12 degrees
    const rotateY = x * 15;
    const rotateX = -y * 15;

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out", // rapid transition following mouse coordinates
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
    });
  };

  const isOutOfStock = book.availableCopies === 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="glass-card relative flex flex-col justify-between overflow-hidden border border-cyan/15 bg-surface/45 shadow-[0_4px_30px_rgba(0,0,0,0.4)] aspect-[3/4.5] sm:aspect-auto p-4 group select-none transition-shadow hover:shadow-[0_0_25px_rgba(0,245,255,0.1)]"
    >
      {/* Decorative Book Corner/Glow Accent */}
      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-cyan/15 to-transparent rounded-bl-full pointer-events-none"></div>

      {/* Book Cover and Quick Info Grid */}
      <div className="space-y-3.5">
        <div className="relative aspect-[3/4.2] overflow-hidden rounded-xl border border-cyan/10 bg-base/50">
          <img
            src={book.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"}
            alt={book.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Genre Label Tag overlay */}
          {book.genre && (
            <span className="absolute top-2.5 left-2.5 bg-base/85 backdrop-blur-md text-cyan border border-cyan/30 text-[10px] font-orbitron font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
              {book.genre}
            </span>
          )}

          {/* Out of stock banner overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-base/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
              <AlertCircle className="h-6 w-6 text-red mb-1.5 animate-bounce" />
              <div className="font-orbitron font-bold text-xs uppercase text-red tracking-wider">Out of Stock</div>
              <div className="font-outfit text-[10px] text-muted">All copies issued</div>
            </div>
          )}
        </div>

        {/* Title, Authors & Meta descriptions */}
        <div>
          <h4 className="font-orbitron text-sm font-bold tracking-tight text-white line-clamp-1 group-hover:text-cyan transition-colors" title={book.title}>
            {book.title}
          </h4>
          <span className="font-outfit text-xs text-muted block line-clamp-1 mt-0.5">
            by {book.author}
          </span>
        </div>

        <p className="font-outfit text-[11px] text-muted/80 line-clamp-2 h-8 leading-snug">
          {book.description || "No description cataloged for this book profile."}
        </p>

        {/* Stock copies indicator progress bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted">
            <span>COPIES AVAILABLE:</span>
            <span className={isOutOfStock ? "text-red font-bold" : "text-green font-bold"}>
              {book.availableCopies} / {book.totalCopies}
            </span>
          </div>
          <div className="h-1.5 w-full bg-base/70 rounded-full overflow-hidden border border-cyan/5">
            <div
              className={`h-full rounded-full ${isOutOfStock ? "bg-red" : "bg-cyan/80"}`}
              style={{ width: `${Math.min(100, (book.availableCopies / book.totalCopies) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Interactive Command Center Bar */}
      <div className="border-t border-cyan/10 pt-3.5 mt-4 flex items-center justify-between gap-2.5">
        {/* Regular Borrow Issue controls */}
        {!showConfirmDelete ? (
          <>
            <button
              disabled={isOutOfStock}
              onClick={() => triggerBorrowModal(book)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wide border transition-all ${
                isOutOfStock
                  ? "bg-transparent border-muted text-muted cursor-not-allowed opacity-50"
                  : "bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan hover:text-[#05050f] hover:shadow-neon-cyan shadow-sm cursor-pointer"
              }`}
            >
              <Library className="h-3.5 w-3.5" />
              <span>Checkout</span>
            </button>

            {/* Admin Tool Set Controls */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={fetchAiSummary}
                title="CyberLibrarian AI Synopsis"
                className="p-1.5 rounded-lg border border-cyan/10 bg-surface/40 hover:border-cyan text-muted hover:text-cyan transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
              <Link
                to={`/books/edit/${book._id}`}
                title="Edit details"
                className="p-1.5 rounded-lg border border-cyan/10 bg-surface/40 hover:border-violet/40 text-muted hover:text-violet transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                title="Remove book"
                className="p-1.5 rounded-lg border border-cyan/10 bg-surface/40 hover:border-red/40 text-muted hover:text-red transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          /* Inline Prompt confirmation state */
          <div className="w-full bg-red/10 border border-red/25 p-2 rounded-lg flex items-center justify-between gap-1.5">
            <span className="font-outfit text-[10px] text-red uppercase tracking-wider font-semibold">Destroy?</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => {
                  onDelete(book._id);
                  setShowConfirmDelete(false);
                }}
                className="px-2 py-0.5 bg-red text-white font-mono text-[9px] font-bold rounded hover:opacity-90"
              >
                YES
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-0.5 bg-muted text-white font-mono text-[9px] rounded hover:opacity-90"
              >
                NO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic AI Synopsis Modal Overlay */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-card max-w-md w-full border border-cyan/25 p-6 space-y-4 relative bg-[#050510]/95 shadow-2xl">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md border border-cyan/10 text-muted hover:text-cyan hover:border-cyan transition-all"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2 border-b border-cyan/10 pb-3">
              <Sparkles className="h-5 w-5 text-cyan animate-pulse" />
              <h3 className="font-orbitron font-bold text-xs uppercase tracking-widest text-white">
                CYBERLIBRARIAN <span className="text-cyan">SYNOPSIS</span>
              </h3>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#00f5ff]/60 block mb-1">
                Analyzing Meta Profile:
              </span>
              <h4 className="font-orbitron font-bold text-sm text-white">{book.title}</h4>
              <p className="text-[11px] font-outfit text-muted leading-relaxed">by {book.author}</p>
            </div>

            <div className="bg-surface/50 p-4 rounded-xl border border-cyan/5 text-xs font-outfit text-text leading-relaxed whitespace-pre-line min-h-[120px] flex items-center justify-center">
              {loadingAi ? (
                <div className="flex flex-col items-center space-y-2 py-6">
                  <div className="h-6 w-6 border-2 border-cyan/25 border-t-cyan text-cyan rounded-full animate-spin"></div>
                  <span className="font-orbitron text-[9px] tracking-wider text-muted animate-pulse font-bold">TRANSCRIBING CHUNKS...</span>
                </div>
              ) : (
                <div className="w-full text-left">{aiSummary}</div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-cyan/10 border border-cyan/30 text-cyan rounded-lg text-xs font-orbitron hover:bg-cyan hover:text-[#050510] hover:shadow-neon-cyan transition-all cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
