import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Library, Compass, Image } from "lucide-react";
import { useBooks } from "../hooks/useBooks.js";

export default function AddBook() {
  const { createBook, loading } = useBooks();
  const navigate = useNavigate();

  // Single React state container matching catalog schema
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
      await createBook({
        ...formData,
        availableCopies: formData.totalCopies // Init available copies identical to total stock
      });
      navigate("/books");
    } catch (err) {
      // Handled in custom hook internally
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Return Catalog Link */}
      <div>
        <Link
          to="/books"
          className="inline-flex items-center space-x-2 text-xs text-muted hover:text-cyan transition-colors group font-orbitron uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1.5 transition-transform" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Title Block */}
      <div className="border-b border-cyan/10 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron">
          REGISTER <span className="text-cyan">NEW BOOK</span>
        </h2>
        <p className="font-outfit text-xs text-muted mt-1 leading-normal">
          Inscribe standard physical library inventory profile details into catalog databases.
        </p>
      </div>

      {/* Entry Registration Form Block */}
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
              placeholder="e.g. Clean Code"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Author input */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Author / writer Name *</label>
            <input
              type="text"
              required
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Robert C. Martin"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* ISBN Serial ID number */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">ISBN Serial (Standard Identifier) *</label>
            <input
              type="text"
              required
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g. 978-0132350884"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-mono text-text focus:outline-none focus:border-cyan/40"
            />
          </div>

          {/* Genre selections */}
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

          {/* Core Copies inventory counts */}
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

          {/* Cover image URL field lookup */}
          <div className="space-y-1.5">
            <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Cover Image Web URL</label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="e.g. https://domain.com/image.jpg"
              className="w-full bg-surface border border-cyan/15 px-3 py-2.5 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
            />
          </div>
        </div>

        {/* Big visual Description overview */}
        <div className="space-y-1.5">
          <label className="font-orbitron text-[10px] tracking-wider font-semibold text-muted">Brief Description & synopsis Details</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="A brief overview describing book plot summary or contents overview details..."
            className="w-full bg-surface border border-cyan/15 px-4 py-3 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40 leading-relaxed resize-none"
          ></textarea>
        </div>

        {/* Submitting Buttons Block */}
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
            <Check className="h-4 w-4" />
            <span>{loading ? "Registering..." : "Submit Book"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
