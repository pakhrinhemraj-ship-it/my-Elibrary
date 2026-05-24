import { useState, useCallback } from "react";
import api from "../api/axios.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import toast from "react-hot-toast";

export const useBorrow = () => {
  const { fetchBorrows, fetchBooks, fetchStats } = useLibrary();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const borrowBook = useCallback(async (borrowData) => {
    setLoading(true);
    try {
      const response = await api.post("/borrow/borrow", borrowData);
      if (response.success) {
        toast.success("Checkout recorded successfully!");
        fetchBorrows();
        fetchBooks();
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Failed to issue book");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBorrows, fetchBooks, fetchStats]);

  const returnBook = useCallback(async (recordId) => {
    setLoading(true);
    try {
      const response = await api.put(`/borrow/return/${recordId}`);
      if (response.success) {
        toast.success("Book returned successfully!");
        fetchBorrows();
        fetchBooks();
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Failed to return book");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBorrows, fetchBooks, fetchStats]);

  const getHistory = useCallback(async (memberId) => {
    setLoading(true);
    try {
      const response = await api.get(`/borrow/history/${memberId}`);
      if (response.success) {
        setHistory(response.data);
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch subscriber checkout history");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    history,
    borrowBook,
    returnBook,
    getHistory,
  };
};
