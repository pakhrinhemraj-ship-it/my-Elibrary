import React, { createContext, useState, useContext, useCallback } from "react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  // Stat Card summaries / Analytical stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Books
  const [books, setBooks] = useState([]);
  const [booksPagination, setBooksPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Members
  const [members, setMembers] = useState([]);
  const [membersPagination, setMembersPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Borrows
  const [borrows, setBorrows] = useState([]);
  const [borrowsPagination, setBorrowsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingBorrows, setLoadingBorrows] = useState(false);

  // Modals / Triggering State
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedRecordForReturn, setSelectedRecordForReturn] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const [activeMemberToEdit, setActiveMemberToEdit] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Fetch Stats helper
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await api.get("/books/stats/summary");
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load library analytics summary");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Books helper
  const fetchBooks = useCallback(async (params = {}) => {
    setLoadingBooks(true);
    try {
      const response = await api.get("/books", { params });
      if (response.success) {
        setBooks(response.data);
        if (response.pagination) {
          setBooksPagination(response.pagination);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to get books catalogue");
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  // Fetch Members helper
  const fetchMembers = useCallback(async (params = {}) => {
    setLoadingMembers(true);
    try {
      const response = await api.get("/members", { params });
      if (response.success) {
        setMembers(response.data);
        if (response.pagination) {
          setMembersPagination(response.pagination);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to get subscribers directory");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  // Fetch Borrows helper
  const fetchBorrows = useCallback(async (params = {}) => {
    setLoadingBorrows(true);
    try {
      const response = await api.get("/borrow", { params });
      if (response.success) {
        setBorrows(response.data);
        if (response.pagination) {
          setBorrowsPagination(response.pagination);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to retrieve circulation borrowings");
    } finally {
      setLoadingBorrows(false);
    }
  }, []);

  // Modify collections to auto update/clear state smoothly
  const triggerBorrowModal = (book = null) => {
    setSelectedBookForBorrow(book);
    setIsBorrowModalOpen(true);
  };

  const closeBorrowModal = () => {
    setSelectedBookForBorrow(null);
    setIsBorrowModalOpen(false);
  };

  const triggerReturnModal = (record) => {
    setSelectedRecordForReturn(record);
    setIsReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setSelectedRecordForReturn(null);
    setIsReturnModalOpen(false);
  };

  const triggerMemberFormModal = (member = null) => {
    setActiveMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const closeMemberFormModal = () => {
    setActiveMemberToEdit(null);
    setIsMemberModalOpen(false);
  };

  return (
    <LibraryContext.Provider
      value={{
        stats,
        loadingStats,
        fetchStats,

        books,
        loadingBooks,
        booksPagination,
        fetchBooks,

        members,
        loadingMembers,
        membersPagination,
        fetchMembers,

        borrows,
        loadingBorrows,
        borrowsPagination,
        fetchBorrows,

        // Modal triggers & references
        selectedBookForBorrow,
        isBorrowModalOpen,
        triggerBorrowModal,
        closeBorrowModal,

        selectedRecordForReturn,
        isReturnModalOpen,
        triggerReturnModal,
        closeReturnModal,

        activeMemberToEdit,
        isMemberModalOpen,
        triggerMemberFormModal,
        closeMemberFormModal,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
