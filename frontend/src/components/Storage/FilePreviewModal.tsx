"use client";

import { Asset } from "@/types";
import { useState } from "react";

interface FilePreviewModalProps {
  asset: Asset | null;
  onClose: () => void;
}

function isImageType(fileType: string | null): boolean {
  if (!fileType) return false;
  return fileType.startsWith("image/");
}

function isVideoType(fileType: string | null): boolean {
  if (!fileType) return false;
  return fileType.startsWith("video/");
}

function isPdfType(fileType: string | null): boolean {
  if (!fileType) return false;
  return fileType === "application/pdf";
}

function isDocType(fileType: string | null): boolean {
  if (!fileType) return false;
  const docTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ];
  return docTypes.includes(fileType);
}

export default function FilePreviewModal({
  asset,
  onClose,
}: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!asset || !asset.storageUrl) return null;

  const handleDownload = () => {
    if (asset.storageUrl) {
      const a = document.createElement("a");
      a.href = asset.storageUrl;
      a.download = asset.name;
      a.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {asset.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(asset.fileSize)} • {formatDate(asset.updatedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-gray-600"
            >
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-black/5 flex items-center justify-center min-h-[400px]">
          {isImageType(asset.fileType) ? (
            // Image Preview
            <div className="w-full h-full flex items-center justify-center p-4">
              {isLoading && (
                <div className="text-gray-400">Loading image...</div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.storageUrl}
                alt={asset.name}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isVideoType(asset.fileType) ? (
            // Video Preview
            <div className="w-full h-full flex items-center justify-center p-4">
              <video
                src={asset.storageUrl}
                controls
                className="max-w-full max-h-full"
                onLoadedMetadata={() => setIsLoading(false)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isPdfType(asset.fileType) ? (
            // PDF Preview
            <div className="w-full h-full flex items-center justify-center p-4">
              <iframe
                src={asset.storageUrl}
                title={asset.name}
                className="w-full h-full border-none"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isDocType(asset.fileType) ? (
            // Document Preview (Office files)
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="text-gray-400 mb-4"
              >
                <path
                  d="M8 6h32l16 16v36c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4z"
                  fill="currentColor"
                  opacity="0.1"
                />
                <path
                  d="M40 6v16h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-gray-600 mb-4">{asset.name}</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Download to view
              </button>
              <p className="text-sm text-gray-400 mt-4">
                {asset.fileType || "Unknown file type"}
              </p>
            </div>
          ) : (
            // Unknown file type
            <div className="flex flex-col items-center justify-center">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="text-gray-400 mb-4"
              >
                <path
                  d="M8 6h32l16 16v36c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4z"
                  fill="currentColor"
                  opacity="0.1"
                />
                <path
                  d="M40 6v16h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-gray-600 mb-4">Preview not available</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Type:</span>{" "}
              {asset.fileType || "Unknown"}
            </p>
            <p>
              <span className="font-medium">Size:</span>{" "}
              {formatFileSize(asset.fileSize)}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
