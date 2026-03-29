"use client";

import { assignees } from "@/store/Store";

export default function TaskToolbar({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (v: string) => void;
}) {
  // Hiện 3 avatar đầu
  const visible = assignees.slice(0, 3);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          className="text-gray-400 flex-shrink-0"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search tasks..."
          className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Avatar group */}
      <div className="hidden sm:flex items-center">
        {visible.map((a, i) => (
          <div
            key={a.id}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-medium flex-shrink-0 cursor-pointer hover:z-10 transition-transform hover:scale-110"
            style={{
              marginLeft: i === 0 ? 0 : -6,
              background: a.color,
              color: a.textColor,
              zIndex: visible.length - i,
            }}
          >
            {a.initials}
          </div>
        ))}
        <div
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-medium bg-gray-100 text-gray-500 cursor-pointer"
          style={{ marginLeft: -6 }}
        >
          +4
        </div>
      </div>

      <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />

      {/* Filter & Sort */}
      <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 4h12M4 8h8M6 12h4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden sm:inline">Filter</span>
      </button>
      <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 5h12M5 9h6M8 13h0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden sm:inline">Sort</span>
      </button>

      <div className="flex-1" />

      {/* More */}
      <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.2" fill="currentColor" />
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
