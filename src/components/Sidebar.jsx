import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookMarked, 
  Users, 
  History, 
  PlusCircle, 
  Settings, 
  ShieldAlert, 
  FileCheck,
  Sparkles
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      path: "/books",
      label: "Books Catalog",
      icon: BookMarked,
      badge: null
    },
    {
      path: "/books/add",
      label: "Register Book",
      icon: PlusCircle,
      badge: null
    },
    {
      path: "/borrowed",
      label: "Circulations",
      icon: History,
      badge: null
    },
    {
      path: "/members",
      label: "Subscribers",
      icon: Users,
      badge: null
    },
    {
      path: "/ai-assistant",
      label: "AI Librarian",
      icon: Sparkles,
      badge: "AI"
    }
  ];

  return (
    <aside className="glass-panel w-64 hidden lg:flex flex-col min-h-screen text-text sticky top-0 p-5 shrink-0 select-none">
      {/* Brand Launcher Icon */}
      <div className="flex items-center space-x-3 mb-8 px-2 py-3 border-b border-cyan/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/15 border border-cyan/30 text-cyan">
          <FileCheck className="h-4.5 w-4.5" />
        </div>
        <div className="font-orbitron text-sm font-semibold tracking-widest text-[#ffffff]">
          LIBCONNECT <span className="text-cyan text-xs">V1</span>
        </div>
      </div>

      {/* Primary Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-outfit font-medium text-sm group ${
                  isActive
                    ? "bg-cyan/15 text-cyan border border-cyan/30 shadow-neon-cyan"
                    : "text-muted hover:bg-surface/50 hover:text-text border border-transparent"
                }`
              }
            >
              <div className="flex items-center space-x-3.5">
                <Icon className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-300" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="font-mono text-[10px] bg-red/20 text-red border border-red/30 px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Decorative Administrator Badge */}
      <div className="mt-auto border-t border-cyan/10 pt-4 px-2">
        <div className="flex items-center space-x-3 bg-surface/30 p-3 rounded-xl border border-cyan/5">
          <div className="h-8 w-8 rounded-lg bg-violet/10 border border-violet/30 flex items-center justify-center text-violet">
            <Settings className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <div className="font-outfit text-xs font-semibold text-text">Root Admin</div>
            <div className="flex items-center space-x-1 text-[10px] text-muted font-mono mt-0.5">
              <ShieldAlert className="h-3 w-3 text-violet" />
              <span>Full Access</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
