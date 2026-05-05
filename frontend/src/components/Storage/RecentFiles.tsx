"use client";

import { useGetRecentAssets } from "@/services/storage.service";
import { useParams } from "next/navigation";
import { Asset } from "@/types";

// Detect file format for icon color
function getDocStyle(fileName: string): {
  bg: string;
  color: string;
  label: string;
} {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { bg: "#FEF2F2", color: "#EF4444", label: "PDF" };
  if (ext === "ppt" || ext === "pptx")
    return { bg: "#FFF7ED", color: "#F97316", label: "PPT" };
  if (ext === "xls" || ext === "xlsx")
    return { bg: "#F0FDF4", color: "#22C55E", label: "XLS" };
  if (ext === "doc" || ext === "docx")
    return { bg: "#EFF6FF", color: "#3B82F6", label: "DOC" };
  if (ext === "jpg" || ext === "jpeg" || ext === "png")
    return { bg: "#FEF3C7", color: "#F59E0B", label: "IMG" };
  return { bg: "#F3F4F6", color: "#6B7280", label: "FILE" };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
  const style = getDocStyle(file.name);

  if (file.isFolder) {
    return (
      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group min-w-0 flex-1">
        {/* Folder Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#FCD34D" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-amber-700"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(file.updatedAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group min-w-0 flex-1">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
        style={{ background: style.bg, color: style.color }}
      >
        {style.label}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatFileSize(file.fileSize)} • {formatDate(file.updatedAt)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!recentAssets || recentAssets.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Recently Modified
        </h2>
        <button className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recentAssets.map((file) => (
          <RecentFileCard key={file.id} file={file} />
        ))}
      </div>
    </section>
  );
}
