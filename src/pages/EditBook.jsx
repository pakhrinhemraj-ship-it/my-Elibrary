import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useBooks } from "../hooks/useBooks.js";

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, updateBook, loading } = useBooks();

  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "Fiction",
    description: "",
    totalCopies: 1,
    coverImage: ""
  });

  const genresList = [
    "Fiction",
    "Science",
    "Technology",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Mystery",
    "Poetry",
    "Drama"
  ];

  // Fetch current book state details on route mount
  useEffect(() => {
    let active = true;
    const fetchRecord = async () => {
      try {
        const record = await getBookById(id);
        if (active && record) {
          setFormData({
            title: record.title || "",
            author: record.author || "",
            isbn: record.isbn || "",
            genre: record.genre || "Fiction",
            description: record.description || "",
            totalCopies: record.totalCopies || 1,
            coverImage: record.coverImage || ""
          });
        }
      } catch (err) {
        navigate("/books");
      } finally {
        if (active) setFetchingData(false);
      }
    };
    fetchRecord();
    return () => {
      active = false;
    };
  }, [id, getBookById, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalCopies" ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBook(id, formData);
      navigate("/books");
    } catch (err) {
      // Handled globally
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 text-cyan animate-spin" />
        <p className="font-orbitron text-xs tracking-wider text-muted animate-pulse">ACQUIRING REGISTRY ENCODINGS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Return Navigation */}
      <div>
        <Link
          to="/books"
          className="inline-flex items-center space-x-2 text-xs text-muted hover:text-cyan transition-colors group font-orbitron uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1.5 transition-transform" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Title section */}
      <div className="border-b border-cyan/10 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron">
          EDIT <span className="text-cyan">CATALOG RECORD</span>
        </h2>
        <p className="font-outfit text-xs text-muted mt-1 leading-normal">
          Modify active metadata settings, total copy stock thresholds, or covers assets.
        </p>
      </div>

      {/* Main configuration edit workspace */}
      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 border border-cyan/15 bg-surface/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Book Title *</label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Author Name */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Author Name *</label>
            <input
              type="text"
              required
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* ISBN Identifier code */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">ISBN (Standard Identifier) *</label>
            <input
              type="text"
              required
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-mono text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Genre Category selections */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Genre Category *</label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            >
              {genresList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Total catalog itemsCopies */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Total Copies physical Stock *</label>
            <input
              type="number"
              required
              min={1}
              name="totalCopies"
              value={formData.totalCopies}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-mono text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Cover image resource link */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Cover Image Web URL</label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>
        </div>

        {/* Synopsis text Description area */}
        <div className="space-y-1.5">
          <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Brief Description & synopsis Details</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Synopsis content details..."
            className="w-full bg-surface border border-cyan/15 px-4 py-3 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40 leading-relaxed resize-none"
          ></textarea>
        </div>

        {/* Configuration Action Keys */}
        <div className="border-t border-cyan/10 pt-6 flex items-center justify-end space-x-4">
          <Link
            to="/books"
            className="px-4 py-2 border border-cyan/10 text-xs text-text hover:bg-surface/70 rounded-lg uppercase tracking-wider font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider neon-btn-cyan cursor-pointer flex items-center space-x-1.5"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving changes..." : "Save Record"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
