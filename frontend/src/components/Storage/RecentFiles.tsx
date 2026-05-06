"use client";

import { useGetRecentAssets } from "@/services/storage.service";
import { useParams } from "next/navigation";
import { Asset } from "@/types";
import SmallDocumentPreview from "./SmallDocumentPreview"; // Đảm bảo đúng đường dẫn

// ─── UTILS TỪ FILE GRID ──────────────────────────────────────
function getThumbnailUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.toLowerCase().endsWith(".pdf")) {
    return url.replace(/\.pdf$/i, ".jpg");
  }
  return url;
}

// Các Icon Components (Có thể export từ file cũ hoặc khai báo lại)
function ZipIconSmall() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500">
      ZIP
    </div>
  );
}

function VideoIconSmall() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
      VID
    </div>
  );
}

function LockedThumbnailSmall() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
      ?
    </div>
  );
}

function FolderIconSmall() {
  return (
    <svg viewBox="0 0 80 60" className="w-6 h-6" fill="none">
      <path
        d="M4 12C4 9.8 5.8 8 8 8h20l6 8h38a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V12z"
        fill="#F59E0B"
      />
      <path d="M4 20h72v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V20z" fill="#FBBF24" />
    </svg>
  );
}

// ─── COMPONENT CHÍNH ──────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateString: string): string {
  try {
    // Nếu dateString từ DB không có 'Z', hãy thêm 'Z' để JS biết đó là giờ UTC
    const normalizedDate = dateString.includes("Z")
      ? dateString
      : dateString.replace(" ", "T") + "Z";
    const date = new Date(normalizedDate);
    const now = new Date();

    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function RecentFileCard({ file }: { file: Asset }) {
  const fileType = file.fileType?.toLowerCase() || "";

  // Logic render thumbnail tương tự FileGrid
  const renderThumbnail = () => {
    if (file.isFolder) return <FolderIconSmall />;

    if (
      file.storageUrl &&
      ["jpg", "jpeg", "png", "webp", "pdf"].includes(fileType)
    ) {
      return (
        <img
          src={getThumbnailUrl(file.storageUrl)}
          alt={file.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }

    if (["docx", "doc", "xlsx", "pptx", "txt"].includes(fileType)) {
      return <SmallDocumentPreview fileUrl={file.storageUrl || ""} />;
    }

    if (["zip", "rar", "7z"].includes(fileType)) return <ZipIconSmall />;

    if (["mp4", "mov", "avi", "webm", "mkv"].includes(fileType))
      return <VideoIconSmall />;

    return <LockedThumbnailSmall />;
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group min-w-0 flex-shrink-0 w-64">
      {/* Container Thumbnail mới thay cho text label cũ */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
        {renderThumbnail()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {file.isFolder ? "Folder" : formatFileSize(file.fileSize)} •{" "}
          {formatDate(file.updatedAt)}
        </p>
      </div>
    </div>
  );
}

export default function RecentFiles() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { data: recentAssets, isLoading } = useGetRecentAssets(projectId, 8);

  if (isLoading) {
    return (
      <section className="mb-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-64 bg-gray-200 rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!recentAssets || recentAssets.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Recently Modified
        </h2>
      </div>
      <div className="flex gap-3 w-full overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
        {recentAssets.map((file) => (
          <RecentFileCard key={file.id} file={file} />
        ))}
      </div>
    </section>
  );
}
