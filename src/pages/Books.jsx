import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, BookOpen, AlertCircle, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useBooks } from "../hooks/useBooks.js";
import BookCard from "../components/BookCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import BorrowModal from "../components/BorrowModal.jsx";

export default function Books() {
  const { 
    books, 
    loadingBooks, 
    booksPagination, 
    fetchBooks, 
    stats 
  } = useLibrary();

  const { deleteBook } = useBooks();

  // Load available genres from stats summaries or use static defaults
  const genresList = stats?.genres?.map(g => g.genre) || [
    "Fiction",
    "Science",
    "Technology",
    "Biography",
    "History",
    "Self-Help",
    "Business"
  ];

  // Search parameters state engine
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Wrapper function to handle filters fetch calls
  const loadBooksCatalog = useCallback(() => {
    fetchBooks({
      search: searchQuery,
      genre: selectedGenre,
      page: currentPage,
      limit: 8
    });
  }, [fetchBooks, searchQuery, selectedGenre, currentPage]);

  useEffect(() => {
    loadBooksCatalog();
  }, [loadBooksCatalog]);

  // Adjust pagination to reset to page 1 on search change
  const handleSearch = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleGenreChange = (val) => {
    setSelectedGenre(val);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < booksPagination.totalPages) {
      setCurrentPage(p => p + 1);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
    } catch (err) {
      // Handled inside custom useBooks hook
    }
  };

  // Stagger configurations for Framer Motion loading grids
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className="space-y-8">
      {/* Upper Brand / Interactive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan/10 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron">
            BOOKS <span className="text-cyan">CATALOG</span>
          </h2>
          <p className="font-outfit text-xs text-muted mt-1 leading-normal">
            Search physical book records, track in-house stocks, and edit item profiles.
          </p>
        </div>
        <Link
          to="/books/add"
          className="self-end md:self-auto px-4 py-2.5 bg-cyan text-[#05050f] font-semibold text-xs rounded-xl uppercase tracking-wider font-orbitron cursor-pointer hover:shadow-neon-cyan active:scale-95 transition-all flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Book</span>
        </Link>
      </div>

      {/* Interactive debounced search and genre filtration widgets */}
      <SearchBar
        placeholder="Search books by title, author or description..."
        onSearch={handleSearch}
        genres={genresList}
        onGenreChange={handleGenreChange}
        initialSearch={searchQuery}
        initialGenre={selectedGenre}
      />

      {/* Main Catalog View Grid */}
      {loadingBooks ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-t-2 border-b-2 border-cyan text-cyan rounded-full animate-spin"></div>
          <p className="font-orbitron text-xs tracking-wider text-muted animate-pulse">RELOAD CATALYSIS CHUNKS...</p>
        </div>
      ) : books.length > 0 ? (
        <div className="space-y-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {books.map((b) => (
              <motion.div
                key={b._id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <BookCard book={b} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>

          {/* Dynamic Pagination Grid Controllers */}
          {booksPagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-cyan/10 pt-6">
              <span className="font-outfit text-xs text-muted">
                Showing Page <span className="font-bold text-white">{booksPagination.page}</span> of <span className="font-semibold text-white">{booksPagination.totalPages}</span> ({booksPagination.total} Total items)
              </span>

              <div className="flex items-center space-x-3 text-xs">
                {/* Previous trigger */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-cyan/15 hover:border-cyan/40 bg-surface/40 hover:bg-surface text-muted hover:text-cyan rounded-lg transition-all disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-cyan/15 cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>

                {/* Page number markers indicator */}
                <div className="hidden sm:flex items-center space-x-1 font-mono">
                  {Array.from({ length: booksPagination.totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isSelected = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold border ${
                          isSelected
                            ? "bg-cyan/15 text-cyan border-cyan/30 shadow-neon-cyan"
                            : "bg-surface/30 border-cyan/5 text-muted hover:text-text hover:border-cyan/20"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next trigger */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === booksPagination.totalPages}
                  className="px-3 py-2 border border-cyan/15 hover:border-cyan/40 bg-surface/40 hover:bg-surface text-muted hover:text-cyan rounded-lg transition-all disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-cyan/15 cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Render beautiful empty feedback states when no items match */
        <div className="text-center py-20 glass-card border border-cyan/10 bg-surface/20 rounded-2xl max-w-lg mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/5 border border-cyan/15 text-cyan mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-sm tracking-wide text-white uppercase">Empty Catalog Results</h4>
            <p className="font-outfit text-xs text-muted max-w-xs mx-auto mt-1 leading-normal">
              We couldn't locate any matching book items. Try refining search keywords or genre toggles.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-cyan/20 hover:border-cyan/55 text-cyan text-xs font-semibold rounded-lg uppercase tracking-wider transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Global popup controls */}
      <BorrowModal />
    </div>
  );
}
