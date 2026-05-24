import React, { useEffect } from "react";
import { motion } from "motion/react";
import { 
  BookMarked, 
  Users, 
  History, 
  AlertCircle, 
  Activity, 
  PieChart as ChartIcon, 
  TrendingUp,
  RotateCcw,
  Clock
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import StatCard from "../components/StatCard.jsx";
import BorrowModal from "../components/BorrowModal.jsx";
import ReturnModal from "../components/ReturnModal.jsx";

// Recharts components
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";

export default function Dashboard() {
  const { stats, loadingStats, fetchStats, triggerReturnModal } = useLibrary();

  // Load analytical stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Motion animation parameters
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Recharts color palette configurations matching Tailwind theme
  const PIE_COLORS = ["#00f5ff", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];

  // Safeguard loading state beautifully
  if (loadingStats && !stats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-t-2 border-b-2 border-cyan text-cyan rounded-full animate-spin mx-auto"></div>
          <p className="font-orbitron text-xs tracking-wider text-muted animate-pulse">GENERATING TELEMETRY INTEGRATIONS...</p>
        </div>
      </div>
    );
  }

  // Fallback structures if stats details are empty
  const summary = stats || {
    totalBooks: 0,
    totalCopies: 0,
    totalAvailable: 0,
    totalBorrowed: 0,
    totalOverdue: 0,
    totalMembers: 0,
    genres: [],
    recentBorrows: [],
    borrowActivity7Days: []
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Upper Brand / Welcome Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan/10 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-widest font-orbitron">
            SYSTEM <span className="text-cyan">DASHBOARD</span>
          </h2>
          <p className="font-outfit text-xs text-muted mt-1 leading-normal">
            Real-time telemetry, circulation tracking analysis, and automated database catalogs.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="self-end md:self-auto px-4 py-2 bg-cyan/5 hover:bg-cyan/15 border border-cyan/20 hover:border-cyan/50 rounded-xl text-xs font-semibold text-cyan uppercase tracking-wide cursor-pointer transition-all flex items-center space-x-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytical Cards Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Books Tracked"
          value={summary.totalBooks}
          icon={BookMarked}
          colorClass="cyan"
          subtext={`Total inventory: ${summary.totalCopies || 0} physical copies`}
        />
        <StatCard
          title="Active Subscriptions"
          value={summary.totalMembers}
          icon={Users}
          colorClass="violet"
          subtext="Membership statuses active"
        />
        <StatCard
          title="On Loan"
          value={summary.totalBorrowed}
          icon={History}
          colorClass="gold"
          subtext={`Copies available: ${summary.totalAvailable || 0}`}
        />
        <StatCard
          title="Overdue Notices"
          value={summary.totalOverdue}
          icon={AlertCircle}
          colorClass="red"
          subtext="Fines calculating daily"
        />
      </div>

      {/* Recharts Analytics Section (Dual Canvas grid grids) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* area line chart: Borrow activity over 7 days */}
        <motion.div
          variants={chartVariants}
          className="glass-card p-5 border border-cyan/15 lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-cyan/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <Activity className="h-4 w-4 text-cyan" />
              <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">
                CIRCULATION ACTIVITY (7 DAYS)
              </h4>
            </div>
            <div className="font-mono text-[10px] text-muted flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-cyan" />
              <span>Real-time Trend</span>
            </div>
          </div>

          <div className="h-64 mt-4 text-xs min-w-0 w-full" style={{ minHeight: "256px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary.borrowActivity7Days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 255, 0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(13, 13, 26, 0.95)",
                    border: "1px solid rgba(0, 245, 255, 0.25)",
                    borderRadius: "12.0px",
                    color: "#e2e8f0",
                    fontFamily: "Outfit",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#00f5ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie/doughnut chart: Genre Breakdown */}
        <motion.div
          variants={chartVariants}
          className="glass-card p-5 border border-cyan/15 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-cyan/10 pb-3">
            <div className="flex items-center space-x-2.5">
              <ChartIcon className="h-4 w-4 text-violet" />
              <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">
                GENRES DISTRIBUTION
              </h4>
            </div>
            <span className="font-mono text-[9px] text-[#8b5cf6] border border-violet/30 px-1.5 py-0.5 roundedbg-violet/10">SHARE</span>
          </div>

          <div className="h-64 flex items-center justify-center min-w-0 w-full" style={{ minHeight: "256px" }}>
            {summary.genres.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.genres}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="genre"
                  >
                    {summary.genres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(13, 13, 26, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.25)",
                      borderRadius: "12.0px",
                      color: "#e2e8f0",
                      fontFamily: "Outfit",
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] text-muted font-outfit uppercase tracking-tight">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-1.5 text-muted">
                <p className="font-outfit text-xs">No genres logged</p>
                <p className="font-mono text-[10px] text-muted/60">Seed database to view categories</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Queue: Recent borrowings status tracking */}
      <div className="glass-card p-5 border border-cyan/15 space-y-4">
        <div className="flex items-center justify-between border-b border-cyan/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <History className="h-4 w-4 text-gold" />
            <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">
              LATEST CIRCULATION LOGS
            </h4>
          </div>
          <span className="font-mono text-[10px] text-muted">Real-time loans dispatch queue</span>
        </div>

        <div className="overflow-x-auto min-w-full">
          {summary.recentBorrows.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyan/5 text-muted font-mono tracking-wider font-semibold text-[10px] uppercase">
                  <th className="py-3 px-2">Book Title</th>
                  <th className="py-3 px-2">Borrower</th>
                  <th className="py-3 px-2">Dates details</th>
                  <th className="py-3 px-2">Fines Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentBorrows.map((r) => {
                  const isReturned = r.status === "returned";
                  const isOverdue = r.status === "overdue";
                  return (
                    <tr key={r._id} className="border-b border-cyan/5 hover:bg-surface/30 transition-colors">
                      {/* Book detail item */}
                      <td className="py-3.5 px-2">
                        <div className="flex items-center space-x-2.5">
                          {r.book?.coverImage && (
                            <img
                              src={r.book.coverImage}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-8 w-6 object-cover rounded border border-cyan/10"
                            />
                          )}
                          <div>
                            <p className="font-outfit font-semibold text-white leading-snug">{r.book?.title || "Deleted Book"}</p>
                            <span className="font-mono text-[9px] text-muted">ID: {r._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Borrower member detail */}
                      <td className="py-3.5 px-2">
                        <p className="font-outfit text-text font-medium">{r.member?.name || "Deleted Member"}</p>
                        <span className="font-mono text-[9px] text-muted">{r.member?.membershipId || "LIB-XXXX"}</span>
                      </td>

                      {/* Borrow & return due dates details */}
                      <td className="py-3.5 px-2 space-y-0.5">
                        <span className="block font-outfit text-text text-[11px]">
                          Borrow: <span className="font-semibold text-muted">{new Date(r.borrowDate).toLocaleDateString()}</span>
                        </span>
                        <span className="block font-outfit text-[11px]">
                          Due limit: <span className={`font-semibold ${isOverdue ? "text-red" : "text-cyan"}`}>{new Date(r.dueDate).toLocaleDateString()}</span>
                        </span>
                      </td>

                      {/* Fine / status visual badges */}
                      <td className="py-3.5 px-2">
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

                          {r.fine > 0 && (
                            <span className="text-[10px] font-semibold text-red font-mono">
                              Fine: Rs. {r.fine}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Inline quick loan transaction triggers */}
                      <td className="py-3.5 px-2 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => triggerReturnModal(r)}
                            className="px-2.5 py-1.5 bg-violet/10 hover:bg-violet border border-violet/30 hover:border-violet text-[#8b5cf6] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Return Book
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted font-mono tracking-widest uppercase pr-2">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-muted space-y-1 bg-surface/20 rounded-xl border border-cyan/5">
              <Clock className="h-6 w-6 text-cyan/30 mx-auto mb-2 animate-pulse" />
              <p className="font-outfit text-xs">No active loans or overdue records tracked today.</p>
              <p className="font-mono text-[9px] text-[#00f5ff]/60">Checkout a book through the registry catalog folder.</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Circulation flow pop-up handles */}
      <BorrowModal />
      <ReturnModal />
    </motion.div>
  );
}
