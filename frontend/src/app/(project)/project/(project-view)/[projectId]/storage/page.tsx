"use client";

import { useState } from "react";
import { projectFiles } from "@/store/storageStore";
import StorageStats from "@/components/Storage/StorageStats";
import RecentFiles from "@/components/Storage/RecentFiles";
import ProjectStorageSection from "@/components/Storage/ProjectStorageSection";
import FileDetailPanel from "@/components/Storage/FileDetailPanel";

export default function StoragePage() {
  const [selectedId, setSelectedId] = useState<string | null>("img-selected");

  const selectedFile = selectedId
    ? (projectFiles.find((f) => f.id === selectedId) ?? null)
    : null;

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className=" relative flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7 max-w-none">
            <StorageStats />
            <RecentFiles />
            <ProjectStorageSection
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selectedFile && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setSelectedId(null)}
          />
          {/* Panel */}
          <div
            className="
            absolute right-0 top-0 bottom-0 z-[99] -[300px] sm:w-[320px] g:relative lg:z-auto lg:w-[300px] xl:w-[320px] lex-shrink-0 overflow-hidden shadow-xl lg:shadow-none
          "
          >
            <FileDetailPanel
              file={selectedFile}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}
