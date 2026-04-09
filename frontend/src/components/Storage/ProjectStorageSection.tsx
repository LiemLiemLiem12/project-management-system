"use client";

import { useState } from "react";
import { projectFiles, StorageFile, ViewMode } from "@/store/storageStore";
import FileGrid from "./FileGrid";

export default function ProjectStorageSection({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          Project Storage
          <svg
            width="14" height="14" viewBox="0 0 12 12" fill="none"
            className="transition-transform duration-200"
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Files */}
      {!collapsed && (
        <FileGrid
          files={projectFiles}
          viewMode={viewMode}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </section>
  );
}
