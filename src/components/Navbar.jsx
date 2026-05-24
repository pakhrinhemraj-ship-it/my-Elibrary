import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Library, 
  Menu, 
  X, 
  LayoutDashboard, 
  BookMarked, 
  History, 
  Users, 
  Sparkles,
  PlusCircle
} from "lucide-react";
import { useLibrary } from "../context/LibraryContext.jsx";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { stats } = useLibrary();
  const [time, setTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/books",
      label: "Books Catalog",
      icon: BookMarked,
    },
    {
      path: "/books/add",
      label: "Register Book",
      icon: PlusCircle,
    },
    {
      path: "/borrowed",
      label: "Circulations",
      icon: History,
    },
    {
      path: "/members",
      label: "Subscribers",
      icon: Users,
    },
    {
      path: "/ai-assistant",
      label: "AI Librarian",
      icon: Sparkles,
      badge: "AI"
    }
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="glass-nav sticky top-0 z-40 flex flex-col px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Brand & Banner */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 border border-cyan/40 text-cyan shadow-neon-cyan animate-pulse">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-orbitron text-lg font-bold tracking-wider text-white">
              E-LIBRARY <span className="text-cyan text-glow">PRO</span>
            </span>
            <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono text-muted tracking-widest mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green animate-ping"></span>
              <span>CATALOG SYNCHRONIZED</span>
            </div>
          </div>
        </div>

        {/* Metrics Bar & Clock (Visible on desktop & larger viewports) */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Live System Time Indicators */}
          <div className="flex items-center bg-surface/50 border border-cyan/10 px-4 py-1.5 rounded-xl text-xs space-x-4">
            <div className="flex items-center space-x-1.5 text-muted">
              <Calendar className="h-3.5 w-3.5 text-cyan" />
              <span className="font-outfit font-medium">{formattedDate}</span>
            </div>
            <div className="h-3 w-[1px] bg-cyan/20"></div>
            <div className="flex items-center space-x-1.5 text-cyan font-mono tracking-wider font-semibold">
              <Clock className="h-3.5 w-3.5 animate-spin-slow" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Total Available Inventory Indicator */}
          <div className="flex items-center px-3 py-1.5 rounded-xl border border-cyan/20 bg-cyan/5 text-xs text-cyan space-x-2 shadow-[0_0_15px_rgba(0,245,255,0.05)]">
            <Library className="h-4 w-4" />
            <span className="font-mono font-bold tracking-tight">
              {stats ? stats.totalAvailable : "0"} AVAILABLE
            </span>
          </div>
        </div>

        {/* Mobile Toggle & Stats Segment */}
        <div className="flex lg:hidden items-center space-x-3">
          {/* Squeezed mobile stats */}
          <div className="flex items-center px-2.5 py-1 rounded-lg border border-cyan/20 bg-cyan/5 text-[10px] text-cyan space-x-1.5">
            <Library className="h-3.5 w-3.5" />
            <span className="font-mono font-bold">{stats ? stats.totalAvailable : "0"}</span>
          </div>

          {/* Menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-cyan/20 bg-surface/50 hover:border-cyan text-muted hover:text-cyan rounded-xl transition-all cursor-pointer focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-cyan/10 pt-4 space-y-4"
          >
            {/* Quick stats / Time display inside mobile menu */}
            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-cyan/10">
              <div className="flex items-center space-x-2 bg-surface/30 p-2.5 rounded-xl border border-cyan/5 text-[11px] text-muted font-outfit">
                <Calendar className="h-3.5 w-3.5 text-cyan shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center space-x-2 bg-surface/30 p-2.5 rounded-xl border border-cyan/5 text-[11px] text-cyan font-mono tracking-wider">
                <Clock className="h-3.5 w-3.5 animate-spin-slow shrink-0" />
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-outfit font-medium text-xs group ${
                        isActive
                          ? "bg-cyan/15 text-cyan border border-cyan/30 shadow-neon-cyan"
                          : "text-muted hover:bg-surface/50 hover:text-text border border-transparent"
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3.5">
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="font-mono text-[9px] bg-red/20 text-red border border-red/30 px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
