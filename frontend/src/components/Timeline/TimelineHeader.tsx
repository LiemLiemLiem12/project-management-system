"use client";

import { ViewMode, formatDateLabel, addDays } from "@/store/timelineStore";

interface Props {
  anchorDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewMode: (v: ViewMode) => void;
  filterText: string;
  onFilterText: (v: string) => void;
}

export default function TimelineHeader({
  anchorDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewMode,
  filterText,
  onFilterText,
}: Props) {
  const views: ViewMode[] = ["Weeks", "Months", "Quarters"];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-[10px] bg-white border-b border-gray-200">
      {/* Left */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button className="flex items-center gap-1.5 p-0 bg-transparent border-none cursor-pointer font-sans hover:opacity-80 transition-opacity">
          <span className="text-[20px] font-bold text-gray-900 whitespace-nowrap">
            {formatDateLabel(anchorDate, viewMode)}
          </span>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4l4 4 4-4"
              stroke="#6B7280"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          onClick={onToday}
          className="px-[14px] py-[5px] text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg cursor-pointer whitespace-nowrap font-sans hover:bg-gray-50 transition-colors"
        >
          Today
        </button>

        <div className="flex gap-0.5">
          {([onPrev, onNext] as const).map((fn, i) => (
            <button
              key={i}
              onClick={fn}
              className="flex items-center justify-center w-7 h-7 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d={i === 0 ? "M8 2L4 6l4 4" : "M4 2l4 4-4 4"}
                  stroke="#6B7280"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search filter */}
        <div className="relative flex items-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute left-[9px] text-gray-400 pointer-events-none"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M11 11l3 3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={filterText}
            onChange={(e) => onFilterText(e.target.value)}
            placeholder="Filter tasks..."
            className="h-8 w-40 pl-7 pr-2.5 text-[13px] text-gray-700 bg-white border border-gray-200 rounded-lg font-sans outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* View toggle */}
        <div className="flex overflow-hidden border border-gray-200 rounded-lg">
          {views.map((v, i) => (
            <button
              key={v}
              onClick={() => onViewMode(v)}
              className={`px-[14px] py-[5px] text-[13px] font-medium cursor-pointer font-sans transition-colors duration-150 ${
                viewMode === v
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              } ${i < views.length - 1 ? "border-r border-gray-200" : ""}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
