import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6 select-none">
      <div className="relative">
        {/* Hologram glow numbers */}
        <h1 className="font-orbitron font-black text-8xl md:text-9xl tracking-wider text-cyan/15 animate-pulse">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="h-16 w-16 text-cyan animate-spin-slow shadow-neon-cyan rounded-full bg-base/50 p-2 border border-cyan/30" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-orbitron font-bold text-lg md:text-xl text-white uppercase tracking-wider">
          COORDINATES LOST
        </h3>
        <p className="font-outfit text-xs md:text-sm text-muted max-w-sm mx-auto leading-relaxed">
          The catalog orbit path you are looking for has disconnected from the server. Return back to base station navigation.
        </p>
      </div>

      <Link
        to="/"
        className="px-5 py-2.5 text-xs font-semibold rounded-xl uppercase tracking-wider font-orbitron neon-btn-cyan flex items-center space-x-2.5 cursor-pointer shadow-md"
      >
        <Home className="h-4 w-4" />
        <span>Return To Dashboard</span>
      </Link>
    </div>
  );
}
