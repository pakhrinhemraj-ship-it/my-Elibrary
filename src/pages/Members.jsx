import React, { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Phone,
  Mail,
  UserX,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { useMembers } from "../hooks/useMembers.js";
import MemberFormModal from "../components/MemberFormModal.jsx";

export default function Members() {
  const { 
    members, 
    loadingMembers, 
    membersPagination, 
    fetchMembers, 
    triggerMemberFormModal 
  } = useLibrary();

  const { deactMember } = useMembers();

  // Search parameters configuration state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // "" (All), "true", "false"
  const [currentPage, setCurrentPage] = useState(1);

  const loadSubscribers = useCallback(() => {
    fetchMembers({
      search: searchTerm,
      active: activeFilter,
      page: currentPage,
      limit: 10
    });
  }, [fetchMembers, searchTerm, activeFilter, currentPage]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  // Handle pagination on search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleActiveTab = (activeVal) => {
    setActiveFilter(activeVal);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < membersPagination.totalPages) {
      setCurrentPage(p => p + 1);
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this membership?")) {
      try {
        await deactMember(id);
      } catch (err) {
        // Handle gracefully
      }
    }
  };

  const activeTabsList = [
    { value: "", label: "All Members" },
    { value: "true", label: "Active" },
    { value: "false", label: "Deactivated" }
  ];

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="space-y-8">
      {/* Upper Brand / Active Title Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan/10 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron">
            SUBSCRIBERS <span className="text-cyan">DIRECTORY</span>
          </h2>
          <p className="font-outfit text-xs text-muted mt-1 leading-normal">
            Manage subscriber memberships profiles, view contact channels, and track loan thresholds.
          </p>
        </div>
        <button
          onClick={() => triggerMemberFormModal(null)}
          className="self-end md:self-auto px-4 py-2.5 bg-cyan text-[#05050f] font-semibold text-xs rounded-xl uppercase tracking-wider font-orbitron cursor-pointer hover:shadow-neon-cyan active:scale-95 transition-all flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Register Subscriber</span>
        </button>
      </div>

      {/* Primary Filtration Workspace and Text Search Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Active tab selectors */}
        <div className="lg:col-span-2 flex flex-wrap gap-2 text-xs font-outfit select-none">
          {activeTabsList.map((tab) => {
            const isSelected = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleActiveTab(tab.value)}
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

        {/* Text Filter input search terms */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or mobile..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface/50 border border-cyan/15 focus:border-cyan/40 focus:outline-none rounded-xl text-xs font-outfit text-text placeholder-muted"
          />
        </div>
      </div>

      {/* Directory database display workspace table */}
      {loadingMembers ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-10 w-10 border-t-2 border-b-2 border-cyan text-cyan rounded-full animate-spin"></div>
          <p className="font-orbitron text-xs tracking-wider text-muted animate-pulse">RECONSTITUING MEMBERS DATABASES...</p>
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-6">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyan/10 text-muted font-mono tracking-widest font-semibold text-[10px] uppercase">
                  <th className="py-3 px-2">Membership ID</th>
                  <th className="py-3 px-2">Subscriber Details</th>
                  <th className="py-3 px-2">Contact details</th>
                  <th className="py-3 px-2">Tier Level</th>
                  <th className="py-3 px-2">Active Books</th>
                  <th className="py-3 px-2">Membership Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerVariants}
                initial="hidden"
                animate="visible"
              >
                {members.map((m) => {
                  const isActive = m.active !== false;
                  return (
                    <tr key={m._id} className="border-b border-cyan/5 hover:bg-surface/30 transition-colors">
                      {/* Membership Identifier card number */}
                      <td className="py-4 px-2 font-mono text-[10px] text-cyan font-bold tracking-wider">
                        {m.membershipId}
                      </td>

                      {/* Name information card details */}
                      <td className="py-4 px-2">
                        <p className="font-outfit font-semibold text-white leading-tight">{m.name}</p>
                        <span className="font-mono text-[9px] text-muted">REG ID: {m._id.slice(-6).toUpperCase()}</span>
                      </td>

                      {/* Phone and Email Contacts block */}
                      <td className="py-4 px-2 space-y-0.5 text-xs">
                        <div className="flex items-center space-x-1.5 text-muted">
                          <Mail className="h-3 w-3 text-cyan" />
                          <span className="font-outfit leading-none">{m.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-muted">
                          <Phone className="h-3 w-3 text-cyan" />
                          <span className="font-mono leading-none">{m.phone}</span>
                        </div>
                      </td>

                      {/* Membership Tier classes label badges */}
                      <td className="py-4 px-2">
                        {m.membershipType === "premium" ? (
                          <span className="bg-violet/10 text-violet border border-violet/25 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide font-bold uppercase">
                            PREMIUM TIER
                          </span>
                        ) : (
                          <span className="bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase">
                            STANDARD
                          </span>
                        )}
                      </td>

                      {/* Active Borrowing limits status count */}
                      <td className="py-4 px-2 font-mono font-bold text-center text-text pl-5">
                        {m.borrowedBooksCount || 0}
                      </td>

                      {/* Activation boolean status visual banner handles */}
                      <td className="py-4 px-2">
                        {isActive ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-green bg-green/10 border border-green/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-green"></span>
                            <span>ACTIVE LEVEL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-muted bg-surface/80 border border-cyan/5">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted"></span>
                            <span>DEACTIVATED</span>
                          </span>
                        )}
                      </td>

                      {/* Settings interactive configurations keys */}
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => triggerMemberFormModal(m)}
                            title="Edit details"
                            className="p-1.5 rounded-lg border border-cyan/10 bg-surface/40 hover:border-violet/40 text-muted hover:text-violet transition-all cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {isActive && (
                            <button
                              onClick={() => handleDeactivate(m._id)}
                              title="Deactivate membership link"
                              className="p-1.5 rounded-lg border border-cyan/10 bg-surface/40 hover:border-red/40 text-muted hover:text-red transition-all cursor-pointer"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>

          {/* Dynamic Pagination Grid Controllers */}
          {membersPagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-cyan/10 pt-6">
              <span className="font-outfit text-xs text-muted">
                Showing Page <span className="font-bold text-white">{membersPagination.page}</span> of <span className="font-semibold text-white">{membersPagination.totalPages}</span> ({membersPagination.total} Subscribers count)
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

                {/* Page levels indexes */}
                <div className="hidden sm:flex items-center space-x-1 font-mono">
                  {Array.from({ length: membersPagination.totalPages }).map((_, i) => {
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
                  disabled={currentPage === membersPagination.totalPages}
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
        /* Empty results warnings card */
        <div className="text-center py-20 glass-card border border-cyan/10 bg-surface/20 rounded-2xl max-w-lg mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/5 border border-cyan/15 text-cyan mx-auto">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-sm tracking-wide text-white uppercase font-bold">Directories Empty</h4>
            <p className="font-outfit text-xs text-muted max-w-xs mx-auto mt-1 leading-normal">
              There are currently no matching subscriber membership registrations in this criteria directory folder.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-cyan/20 hover:border-cyan/55 text-cyan text-xs font-semibold rounded-lg uppercase tracking-wider transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Subscriber setup pop-up modal configurations dialog */}
      <MemberFormModal />
    </div>
  );
}
