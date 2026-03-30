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
  anchorDate, viewMode, onPrev, onNext, onToday, onViewMode, filterText, onFilterText,
}: Props) {
  const views: ViewMode[] = ["Weeks", "Months", "Quarters"];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 20px", borderBottom: "1px solid #E5E7EB",
      background: "white", gap: 12, flexWrap: "wrap",
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", padding: 0,
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
            {formatDateLabel(anchorDate, viewMode)}
          </span>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        <button onClick={onToday} style={{
          border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 14px",
          fontSize: 13, fontWeight: 500, color: "#374151", background: "white",
          cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>Today</button>

        <div style={{ display: "flex", gap: 2 }}>
          {([onPrev, onNext] as const).map((fn, i) => (
            <button key={i} onClick={fn} style={{
              width: 28, height: 28, border: "1px solid #E5E7EB", borderRadius: 6,
              background: "white", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d={i === 0 ? "M8 2L4 6l4 4" : "M4 2l4 4-4 4"} stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* Search filter */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
            style={{ position: "absolute", left: 9, color: "#9CA3AF", pointerEvents: "none" }}>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={filterText}
            onChange={e => onFilterText(e.target.value)}
            placeholder="Filter tasks..."
            style={{
              paddingLeft: 28, paddingRight: 10, height: 32, width: 160,
              border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13,
              color: "#374151", background: "white", outline: "none", fontFamily: "inherit",
            }}
          />
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
          {views.map((v, i) => (
            <button key={v} onClick={() => onViewMode(v)} style={{
              padding: "5px 14px", fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", fontFamily: "inherit",
              background: viewMode === v ? "#EFF6FF" : "white",
              color: viewMode === v ? "#2563EB" : "#6B7280",
              borderRight: i < views.length - 1 ? "1px solid #E5E7EB" : "none",
              transition: "background 0.15s, color 0.15s",
            }}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
