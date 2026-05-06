"use client";

import { useState } from "react";
import { Asset } from "@/types";
import { useGetAssetsByProject } from "@/services/storage.service";
import { useParams } from "next/navigation";
import FileGrid, { ViewMode } from "./FileGrid";

export default function ProjectStorageSection({
  selectedId,
  onSelect,
  onDoubleClick,
  onContextMenu,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (file: Asset) => void;
  onContextMenu: (e: React.MouseEvent, file: Asset | null) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [collapsed, setCollapsed] = useState(false);

  const params = useParams();
  const projectId = params?.projectId as string;
  const currentFolderId = selectedId || null; // For now, load root folder

  const {
    data: files = [],
    isLoading,
    refetch,
  } = useGetAssetsByProject(projectId, !currentFolderId);

  // Expose refetch for mutations
  if (typeof window !== "undefined" && !window.__storageRefetch) {
    (window as any).__storageRefetch = refetch;
  }

  return (
    <section>
      {/* Toolbar */}
      <div className="flex  items-center justify-between mb-4">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          Project Storage
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            className="transition-transform duration-200"
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="2"
                y="2"
                width="5"
                height="5"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <rect
                x="9"
                y="2"
                width="5"
                height="5"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <rect
                x="2"
                y="9"
                width="5"
                height="5"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <rect
                x="9"
                y="9"
                width="5"
                height="5"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Files */}
      {!collapsed && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-pulse">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : files && files.length > 0 ? (
            <FileGrid
              files={files}
              viewMode={viewMode}
              selectedId={selectedId}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
              onContextMenu={onContextMenu}
            />
          ) : (
            <div
              onContextMenu={(e) => {
                onContextMenu(e, null);
              }}
              className="flex items-center justify-center py-12 text-center"
            >
              <div>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="mx-auto mb-3 text-gray-300"
                >
                  <path
                    d="M24 4L4 14v20a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V14l-20-10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-500 text-sm">No files yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Upload or create your first file
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
