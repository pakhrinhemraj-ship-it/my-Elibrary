import React, { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { 
  History, 
  Search, 
  SlidersHorizontal, 
  HelpCircle, 
  AlertCircle,
  FileCheck,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import ReturnModal from "../components/ReturnModal.jsx";

export default function BorrowedBooks() {
  const { 
    borrows, 
    loadingBorrows, 
    borrowsPagination, 
    fetchBorrows, 
    triggerReturnModal 
  } = useLibrary();

  // Route configurations & parameters engine state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" (All), "borrowed", "returned", "overdue"
  const [currentPage, setCurrentPage] = useState(1);

  const loadCirculations = useCallback(() => {
    fetchBorrows({
      search: searchTerm,
      status: statusFilter,
      page: currentPage,
      limit: 10
    });
  }, [fetchBorrows, searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    loadCirculations();
  }, [loadCirculations]);

  // Debouncing Search trigger updates (300ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleStatusTab = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < borrowsPagination.totalPages) {
      setCurrentPage(p => p + 1);
    }
  };

  // Status indicators formatting utilities
  const statusTabsList = [
    { value: "", label: "All Records" },
    { value: "borrowed", label: "Out on Loan" },
    { value: "overdue", label: "Overdue" },
    { value: "returned", label: "Returned" }
  ];

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="space-y-8">
      {/* Upper Brand Info layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan/10 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron">
            CIRCULATION <span className="text-cyan">MANAGEMENT</span>
          </h2>
          <p className="font-outfit text-xs text-muted mt-1 leading-normal">
            Assess lending status queues, retrieve returned historical entries, and collect fine fees.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search configuration layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Status filtering sliding tabs bar */}
        <div className="lg:col-span-2 flex flex-wrap gap-2 text-xs font-outfit select-none">
          {statusTabsList.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleStatusTab(tab.value)}
                className={`px-4 py-2.5 rounded-xl border font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan/15 border-cyan/40 text-cyan shadow-neon-cyan"
                    : "bg-surface/50 border-cyan/5 text-muted hover:border-cyan/15 hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search bar input text matching */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by book or borrower..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface/50 border border-cyan/15 focus:border-cyan/40 focus:outline-none rounded-xl text-xs font-outfit text-text placeholder-muted"
          />
        </div>
      </div>

      {/* Primary Circulation Grid data list */}
      {loadingBorrows ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-t-2 border-b-2 border-cyan text-cyan rounded-full animate-spin"></div>
          <p className="font-orbitron text-xs tracking-wider text-muted animate-pulse">EXTRACTING METRICATION GRIDS...</p>
        </div>
      ) : borrows.length > 0 ? (
        <div className="space-y-6">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyan/10 text-muted font-mono tracking-widest font-semibold text-[10px] uppercase">
                  <th className="py-3 px-2">Transaction Details</th>
                  <th className="py-3 px-2">Book Title</th>
                  <th className="py-3 px-2">Subscriber profile</th>
                  <th className="py-3 px-2">Lending Dates Details</th>
                  <th className="py-3 px-2">Circulation Condition</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerVariants}
                initial="hidden"
                animate="visible"
              >
                {borrows.map((b) => {
                  const isReturned = b.status === "returned";
                  const isOverdue = b.status === "overdue";
                  return (
                    <tr key={b._id} className="border-b border-cyan/5 hover:bg-surface/30 transition-colors">
                      {/* Transaction Identifier code */}
                      <td className="py-4 px-2 font-mono text-[10px] text-muted">
                        TXN-{b._id.slice(-8).toUpperCase()}
                      </td>

                      {/* Book detail title info */}
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2.5">
                          {b.book?.coverImage && (
                            <img
                              src={b.book.coverImage}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-9 w-7.5 object-cover rounded border border-cyan/10"
                            />
                          )}
                          <div>
                            <p className="font-outfit font-semibold text-white leading-snug line-clamp-1 max-w-xs">{b.book?.title || "Deleted Record"}</p>
                            <span className="text-[10px] text-muted block mt-0.5 font-outfit">ISBN: {b.book?.isbn || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Borrower name details */}
                      <td className="py-4 px-2">
                        <p className="font-outfit text-text font-medium">{b.member?.name || "Deleted Subscriber"}</p>
                        <span className="font-mono text-[9px] text-muted">{b.member?.membershipId || "LIB-XXXX"}</span>
                      </td>

                      {/* Borrow & return schedules info */}
                      <td className="py-4 px-2 space-y-0.5 text-xs">
                        <div className="font-outfit text-muted">
                          Checked out: <span className="font-semibold text-text">{new Date(b.borrowDate).toLocaleDateString()}</span>
                        </div>
                        <div className="font-outfit text-muted">
                          Expected back: <span className={`font-semibold ${isOverdue ? "text-red" : "text-cyan"}`}>{new Date(b.dueDate).toLocaleDateString()}</span>
                        </div>
                        {isReturned && b.returnDate && (
                          <div className="font-outfit text-green-400">
                            Returned: <span className="font-semibold">{new Date(b.returnDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>

                      {/* Fines analysis & active circulation status badges */}
                      <td className="py-4 px-2">
                        <div className="flex flex-col space-y-1">
                          {isReturned ? (
                            <span className="inline-flex max-w-fit px-2 py-0.5 rounded text-[10px] font-mono text-green bg-green/10 border border-green/20">
                              RETURNED
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex max-w-fit px-2 py-0.5 rounded text-[10px] font-mono text-red bg-red/10 border border-red/20 animate-pulse">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="inline-flex max-w-fit px-2 py-0.5 rounded text-[10px] font-mono text-gold bg-gold/10 border border-gold/20">
                              OUT ON LOAN
                            </span>
                          )}

                          {b.fine > 0 && (
                            <span className="text-[10px] font-semibold text-red font-mono">
                              Penalty: Rs. {b.fine}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Commands returning keys */}
                      <td className="py-4 px-2 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => triggerReturnModal(b)}
                            className="px-3 py-1.5 bg-violet/10 hover:bg-violet border border-violet/30 hover:border-violet text-[#8b5cf6] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Return Item
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted font-mono tracking-widest uppercase pr-2">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>

          {/* Dynamic Pagination Grid Controllers */}
          {borrowsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-cyan/10 pt-6">
              <span className="font-outfit text-xs text-muted">
                Showing Page <span className="font-bold text-white">{borrowsPagination.page}</span> of <span className="font-semibold text-white">{borrowsPagination.totalPages}</span> ({borrowsPagination.total} Total Transacts)
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

                {/* Page indicators */}
                <div className="hidden sm:flex items-center space-x-1 font-mono">
                  {Array.from({ length: borrowsPagination.totalPages }).map((_, i) => {
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
                  disabled={currentPage === borrowsPagination.totalPages}
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
        /* Empty results warning card layout block */
        <div className="text-center py-20 glass-card border border-cyan/10 bg-surface/20 rounded-2xl max-w-lg mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/5 border border-cyan/15 text-cyan mx-auto">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-sm tracking-wide text-white uppercase font-bold">No Records Found</h4>
            <p className="font-outfit text-xs text-muted max-w-xs mx-auto mt-1 leading-normal">
              There are currently no matching circulation checkout transactions registered on this criteria status.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-cyan/20 hover:border-cyan/55 text-cyan text-xs font-semibold rounded-lg uppercase tracking-wider transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Popup circulation return trigger handler */}
      <ReturnModal />
    </div>
  );
}
