import { useState, useCallback } from "react";
import api from "../api/axios.js";
import { useLibrary } from "../context/LibraryContext.jsx";
import toast from "react-hot-toast";

export const useMembers = () => {
  const { fetchMembers, fetchStats } = useLibrary();
  const [loading, setLoading] = useState(false);

  const getMemberById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/members/${id}`);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Failed to find the subscriber");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(async (memberData) => {
    setLoading(true);
    try {
      const response = await api.post("/members", memberData);
      if (response.success) {
        toast.success("Subscriber registered successfully!");
        fetchMembers();
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers, fetchStats]);

  const updateMember = useCallback(async (id, memberData) => {
    setLoading(true);
    try {
      const response = await api.put(`/members/${id}`, memberData);
      if (response.success) {
        toast.success("Subscriber profile updated!");
        fetchMembers();
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || "Profile updates failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers, fetchStats]);

  const deactMember = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/members/${id}`);
      if (response.success) {
        toast.success("Subscriber membership deactivated");
        fetchMembers();
        fetchStats();
        return true;
      }
    } catch (err) {
      toast.error(err.message || "Deactivation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers, fetchStats]);

  return {
    loading,
    getMemberById,
    createMember,
    updateMember,
    deactMember,
  };
};
