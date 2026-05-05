"use client";

import React from "react";

interface UploadProgressProps {
  isUploading: boolean;
  fileName?: string;
  progress?: number;
}

export default function UploadProgress({
  isUploading,
  fileName,
  progress,
}: UploadProgressProps) {
  if (!isUploading) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white shadow-xl rounded-xl border border-gray-100 p-4 z-50 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Loading...</p>
          {fileName && (
            <p className="text-xs text-gray-500 truncate" title={fileName}>
              {fileName}
            </p>
          )}
        </div>

        {progress !== undefined && (
          <span className="text-sm font-medium text-blue-600">{progress}%</span>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
