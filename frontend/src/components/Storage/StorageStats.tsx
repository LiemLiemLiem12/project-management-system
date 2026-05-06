"use client";

import { useGetStorageUsage } from "@/services/storage.service";
import { useParams } from "next/navigation";

const MAX_STORAGE_GB = 10; // Biến có thể chỉnh

const FILE_TYPE_COLORS: Record<string, string> = {
  image: "#22C55E",
  document: "#F59E0B",
  video: "#3B82F6",
  other: "#EC4899",
  folder: "#8B5CF6",
};

const FILE_TYPE_LABELS: Record<string, string> = {
  image: "Image",
  document: "Document",
  video: "Video",
  other: "Others",
  folder: "Folders",
};

export default function StorageStats() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const { data: usage, isLoading, error } = useGetStorageUsage(projectId);

  // Convert bytes to GB
  const usedGB = usage ? usage.usedBytes / (1024 * 1024 * 1024) : 0;
  const remainingGB = MAX_STORAGE_GB - usedGB;
  const remainingPct = Math.round((remainingGB / MAX_STORAGE_GB) * 100);

  // Build breakdown from usage data
  const breakdown = usage
    ? usage.breakdown.map((item) => ({
        type: item.type as string,
        label: FILE_TYPE_LABELS[item.type] || item.type,
        percent:
          usage.usedBytes > 0
            ? Math.round((item.bytes / usage.usedBytes) * 100)
            : 0,
        color: FILE_TYPE_COLORS[item.type] || "#9CA3AF",
      }))
    : [];

  if (isLoading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-2 bg-gray-200 rounded-full w-full" />
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Unable to load storage information. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Data Storage
        </h1>
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900 text-base">
            {usedGB.toFixed(2)} GB
          </span>{" "}
          out of{" "}
          <span className="font-bold text-gray-900 text-base">
            {MAX_STORAGE_GB} GB
          </span>{" "}
          used
        </p>
      </div>

      {/* Breakdown bars */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-2">
        {breakdown.map((b) => (
          <div key={b.type} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: b.color }}
            />
            <span className="text-xs font-medium text-gray-600">{b.label}</span>
            <span className="text-xs text-gray-400">{b.percent}%</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-sm font-semibold text-gray-700">
            {remainingGB.toFixed(2)} GB remaining
          </span>
          <span className="text-sm text-gray-400">{remainingPct}%</span>
        </div>
      </div>

      {/* Progress bars */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        {breakdown.map((b) => (
          <div
            key={b.type}
            className="h-full rounded-full transition-all"
            style={{ width: `${b.percent}%`, background: b.color }}
          />
        ))}
        <div className="flex-1 h-full bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}
