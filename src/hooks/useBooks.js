import { useState, useCallback } from "react";
import api from "../api/axios.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import toast from "react-hot-toast";

export const useBooks = () => {
  const { fetchBooks, fetchStats } = useLibrary();
  const [loading, setLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  const getBookById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/books/${id}`);
      if (response.success) {
        setCurrentBook(response.data);
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Failed to find the book");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBook = useCallback(async (bookData) => {
    setLoading(true);
    try {
      const response = await api.post("/books", bookData);
      if (response.success) {
        toast.success("Book registered successfully into the catalog!");
        fetchBooks();
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Could not save book record");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBooks, fetchStats]);

  const updateBook = useCallback(async (id, bookData) => {
    setLoading(true);
    try {
      const response = await api.put(`/books/${id}`, bookData);
      if (response.success) {
        toast.success("Book updated successfully!");
        fetchBooks();
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Could not update book");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBooks, fetchStats]);

  const deleteBook = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/books/${id}`);
      if (response.success) {
        toast.success("Book removed successfully from catalog");
        fetchBooks();
        fetchStats();
        return true;
      }
    } catch (err) {
      toast.error(err.message || "Unable to remove book");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBooks, fetchStats]);

  return {
    loading,
    currentBook,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
  };
};
