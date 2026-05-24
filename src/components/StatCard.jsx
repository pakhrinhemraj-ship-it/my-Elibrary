import React from "react";
import { motion } from "motion/react";

export default function StatCard({ title, value, icon: Icon, colorClass = "cyan", subtext, isCurrency = false }) {
  // Define styling dynamically based on the design tokens
  const styleConfig = {
    cyan: {
      border: "border-cyan/20",
      shadow: "shadow-[0_0_20px_rgba(0,245,255,0.05)]",
      text: "text-cyan",
      bg: "bg-cyan/10",
    },
    violet: {
      border: "border-violet/20",
      shadow: "shadow-[0_0_20px_rgba(139,92,246,0.05)]",
      text: "text-violet",
      bg: "bg-violet/10",
    },
    gold: {
      border: "border-gold/20",
      shadow: "shadow-[0_0_20px_rgba(245,158,11,0.05)]",
      text: "text-gold",
      bg: "bg-gold/10",
    },
    red: {
      border: "border-red/20",
      shadow: "shadow-[0_0_20px_rgba(239,68,68,0.05)]",
      text: "text-red",
      bg: "bg-red/10",
    },
    green: {
      border: "border-green/20",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.05)]",
      text: "text-green",
      bg: "bg-green/10",
    },
  };

  const choice = styleConfig[colorClass] || styleConfig.cyan;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, border: "1px solid rgba(0, 245, 255, 0.3)" }}
      className={`glass-card p-5 flex items-center justify-between border ${choice.border} ${choice.shadow} relative overflow-hidden group select-none`}
    >
      {/* Absolute Background Accent Glow */}
      <div className={`absolute -right-10 -bottom-10 h-32 w-32 rounded-full ${choice.text} opacity-[0.02] filter blur-xl group-hover:scale-125 transition-transform duration-500`}></div>

      {/* Main Metadata Grid */}
      <div className="space-y-2">
        <span className="font-outfit text-xs font-semibold uppercase tracking-wider text-muted">
          {title}
        </span>
        <h3 className="font-orbitron font-extrabold text-2xl tracking-normal text-white">
          {isCurrency && "Rs. "}
          {value !== null && value !== undefined ? value : "—"}
        </h3>
        {subtext && (
          <span className="block font-outfit text-[11px] text-muted tracking-wide font-normal">
            {subtext}
          </span>
        )}
      </div>

      {/* Metric Circular Accent Icon */}
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${choice.bg} border border-${colorClass}/20`}>
        <Icon className={`h-5 w-5 ${choice.text} group-hover:rotate-[15deg] transition-transform duration-300`} />
      </div>
    </motion.div>
  );
}
