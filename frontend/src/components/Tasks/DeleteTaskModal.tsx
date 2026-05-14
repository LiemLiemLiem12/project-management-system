"use client";

import { useEffect, useRef, useState } from "react";

export default function DeleteTaskModal({
  taskCode,
  onConfirm,
  onArchive,
  onClose,
}: {
  taskCode: string;
  onConfirm: () => void;
  onArchive: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const canDelete = input.trim().toLowerCase() === "delete";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 3.5v3m0 2v.5"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              Delete {taskCode}?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          You can choose to delete this work item and all its subtasks. Deleting
          is irreversible. It permanently removes the work item, subtasks,
          comments and attachments. To keep subtasks move them to a different
          parent.
        </p>

        {/* Input */}
        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-2">
            Type <span className="font-semibold text-gray-900">delete</span> to
            continue
          </label>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=""
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={canDelete ? onConfirm : undefined}
            disabled={!canDelete}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              canDelete
                ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
