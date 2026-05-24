import React, { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export default function SearchBar({
  placeholder = "Search catalog...",
  onSearch,
  genres = [],
  onGenreChange,
  onActiveFilterChange,
  showActiveToggle = false,
  initialSearch = "",
  initialGenre = "",
  initialActive = ""
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedActive, setSelectedActive] = useState(initialActive);

  // Debouncing Search inputs (300ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan/15">
      {/* Text Input Handler with Search Icon */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-surface/40 border border-cyan/15 rounded-xl text-sm font-outfit text-text placeholder-muted focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30 transition-all"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-cyan transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Advanced Filter Selections */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center space-x-2 text-xs text-muted pr-1">
          <SlidersHorizontal className="h-3.5 w-3.5 text-cyan" />
          <span className="font-mono tracking-wider hidden sm:inline">FILTERS:</span>
        </div>

        {/* Genre Select Dropdown Filter */}
        {onGenreChange && (
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              onGenreChange(e.target.value);
            }}
            className="flex-1 md:flex-none px-3.5 py-2.5 bg-surface/40 border border-cyan/15 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
          >
            <option value="" className="bg-surface text-text">Any Genre</option>
            {genres.map((g) => (
              <option key={g} value={g} className="bg-surface text-text">
                {g}
              </option>
            ))}
          </select>
        )}

        {/* Active Subscriber Status Toggle Filter */}
        {showActiveToggle && onActiveFilterChange && (
          <select
            value={selectedActive}
            onChange={(e) => {
              setSelectedActive(e.target.value);
              onActiveFilterChange(e.target.value);
            }}
            className="flex-1 md:flex-none px-3.5 py-2.5 bg-surface/40 border border-cyan/15 rounded-xl text-xs font-outfit text-text focus:outline-none focus:border-cyan/40"
          >
            <option value="" className="bg-surface text-text">All Members</option>
            <option value="true" className="bg-surface text-text">Active Only</option>
            <option value="false" className="bg-surface text-text">Deactivated Only</option>
          </select>
        )}
      </div>
    </div>
  );
}
