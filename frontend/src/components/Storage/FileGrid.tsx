"use client";

import { Asset } from "@/types";
import Image from "next/image";
import { useRef } from "react";
import SmallDocumentPreview from "./SmallDocumentPreview";

export type ViewMode = "grid" | "list";

function getThumbnailUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.toLowerCase().endsWith(".pdf")) {
    return url.replace(/\.pdf$/i, ".jpg");
  }
  return url;
}

// ─── Folder icon ──────────────────────────────────────────────
function FolderIcon() {
  return (
    <svg viewBox="0 0 80 60" className="w-full h-full" fill="none">
      <path
        d="M4 12C4 9.8 5.8 8 8 8h20l6 8h38a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V12z"
        fill="#F59E0B"
      />
      <path d="M4 20h72v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V20z" fill="#FBBF24" />
      {/* folder tab decoration */}
      <rect
        x="20"
        y="44"
        width="12"
        height="3"
        rx="1.5"
        fill="rgba(255,255,255,0.3)"
      />
      <rect
        x="36"
        y="44"
        width="12"
        height="3"
        rx="1.5"
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  );
}

function LockedThumbnail() {
  return (
    <div className="relative w-full h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
      {/* Icon ổ khóa nằm đè lên trên */}
      <div className="relative z-10 bg-white/90 p-1.5 rounded-full shadow-sm border border-gray-200 text-gray-500 backdrop-blur-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-5 h-5 sm:w-6 sm:h-6" // Responsive size
        >
          {/* Thân ổ khóa */}
          <rect
            x="5"
            y="11"
            width="14"
            height="10"
            rx="2"
            ry="2"
            strokeWidth={1.5}
          />
          {/* Móc khóa */}
          <path
            d="M7 11V7a5 5 0 0110 0v4"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Zip Icon ──────────────────────────────────────────────
function ZipIcon() {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center rounded-lg border border-gray-100">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-1/2 h-1/2 text-gray-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 3v2h2V3m-2 4v2h2V7m-2 4v2h2v-2"
        />
      </svg>
    </div>
  );
}

// ─── Video Icon ────────────────────────────────────────────
function VideoIcon() {
  return (
    <div className="w-full h-full bg-indigo-50 flex flex-col items-center justify-center rounded-lg border border-indigo-100">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-1/2 h-1/2 text-indigo-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

// ─── Grid file card ───────────────────────────────────────────
function FileGridCard({
  file,
  selected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: {
  file: Asset;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent, file: Asset) => void;
}) {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onDoubleClick();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        onClick();
        clickTimeoutRef.current = null;
      }, 200);
    }
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, file);
      }}
      className={`cursor-pointer group flex flex-col items-center gap-2 p-2 rounded-xl transition-all
        ${
          selected
            ? "ring-2 ring-blue-400 ring-offset-1 bg-blue-50/40"
            : "hover:bg-gray-50"
        }`}
    >
      {/* Thumbnail area */}
      <div
        className={`w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center
        ${selected ? "ring-2 ring-cyan-400" : ""}
        ${file.isFolder ? "p-3 bg-transparent" : "bg-gray-50"}`}
      >
        {file.isFolder ? (
          <FolderIcon />
        ) : file.storageUrl &&
          ["jpg", "jpeg", "png", "webp", "pdf"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <img
            src={getThumbnailUrl(file.storageUrl)}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : ["docx", "doc", "xlsx", "pptx", "txt"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <SmallDocumentPreview fileUrl={file.storageUrl || ""} />
        ) : ["zip", "rar", "7z"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <ZipIcon />
        ) : ["mp4", "mov", "avi", "webm", "mkv"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <VideoIcon />
        ) : (
          <LockedThumbnail />
        )}
      </div>
      {/* Name */}
      <p className="text-xs font-medium text-gray-700 text-center truncate w-full px-1 leading-tight">
        {file.name}
      </p>
    </div>
  );
}

// ─── List file row ────────────────────────────────────────────
function FileListRow({
  file,
  selected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: {
  file: Asset;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent, file: Asset) => void;
}) {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onDoubleClick();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        onClick();
        clickTimeoutRef.current = null;
      }, 200);
    }
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, file);
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${selected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"}`}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
        {file.isFolder ? (
          <FolderIcon />
        ) : file.storageUrl &&
          ["jpg", "jpeg", "png", "webp", "pdf"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <img
            src={getThumbnailUrl(file.storageUrl)}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : ["docx", "doc", "xlsx", "pptx", "txt"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <SmallDocumentPreview fileUrl={file.storageUrl || ""} />
        ) : ["zip", "rar", "7z"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <ZipIcon />
        ) : ["mp4", "mov", "avi", "webm", "mkv"].includes(
            file.fileType?.toLowerCase() || "",
          ) ? (
          <VideoIcon />
        ) : (
          <LockedThumbnail />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-400">
          {formatFileSize(file.fileSize)} • {formatDate(file.updatedAt)}
        </p>
      </div>
    </div>
  );
}

// ─── FileGrid ─────────────────────────────────────────────────
export default function FileGrid({
  files,
  viewMode,
  selectedId,
  onSelect,
  onDoubleClick,
  onContextMenu,
}: {
  files: Asset[];
  viewMode: ViewMode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDoubleClick: (file: Asset) => void;
  onContextMenu: (e: React.MouseEvent, file: Asset | null) => void;
}) {
  const handleEmptyAreaContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, null);
  };

  return (
    <div
      className="h-full min-h-[50vh] w-full pb-50"
      onContextMenu={handleEmptyAreaContextMenu}
    >
      {viewMode === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {files.map((f) => (
            <FileGridCard
              key={f.id}
              file={f}
              selected={f.id === selectedId}
              onClick={() => onSelect(f.id)}
              onDoubleClick={() => onDoubleClick(f)}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {files.map((f) => (
            <FileListRow
              key={f.id}
              file={f}
              selected={f.id === selectedId}
              onClick={() => onSelect(f.id)}
              onDoubleClick={() => onDoubleClick(f)}
              onContextMenu={(e) => onContextMenu(e, f)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
