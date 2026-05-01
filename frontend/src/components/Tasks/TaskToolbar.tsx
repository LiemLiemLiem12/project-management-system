"use client";

import { useProjectStore } from "@/store/project.store";
import FilterButton, { FilterState } from "@/components/Kanban/FilterButton";

export default function TaskToolbar({
  search,
  onSearch,
  onFilterChange, // 🚀 Thêm prop này để truyền data filter lên component cha
}: {
  search: string;
  onSearch: (v: string) => void;
  onFilterChange?: (filters: FilterState) => void;
}) {
  // 🚀 Lấy danh sách thành viên THẬT từ project
  const members = useProjectStore((s) => s.members) || [];

  // Hiện tối đa 3 avatar đầu tiên
  const visibleMembers = members.slice(0, 3);
  const remainingCount = members.length > 3 ? members.length - 3 : 0;

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

      {/* 🚀 AVATAR GROUP DÙNG DATA THẬT */}
      <div className="hidden sm:flex items-center">
        {visibleMembers.map((m: any, i) => {
          const name = m.full_name || m.user_id || "U";
          const initial = name.charAt(0).toUpperCase();
          const avatarUrl = m.avatar || m.avatar_url;

          return (
            <div
              key={m.user_id}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 cursor-pointer hover:z-10 transition-transform hover:scale-110 shadow-sm overflow-hidden bg-gradient-to-tr from-blue-400 to-indigo-500 text-white"
              style={{
                marginLeft: i === 0 ? 0 : -6,
                zIndex: visibleMembers.length - i,
              }}
              title={name}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-medium bg-gray-100 text-gray-500 cursor-pointer"
            style={{ marginLeft: -6 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />

      {/* 🚀 CHÈN FILTER BUTTON VÀO ĐÂY */}
      <FilterButton onFilterChange={onFilterChange} />

      {/* Sort */}
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
