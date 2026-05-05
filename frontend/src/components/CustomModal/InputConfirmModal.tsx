"use client";

import React, { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  description?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmColorClass?: string;
}

const InputConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "Huỷ",
  confirmText = "Xác nhận",
  confirmColorClass = "bg-primary hover:bg-blue-800 text-white",
}) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lớp nền mờ (Backdrop). Click vào đây sẽ đóng modal */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Nội dung Modal */}
      <div className="relative z-10 w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-xl transform transition-all">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-normal text-gray-900 mb-4">{title}</h2>

        {/* Nội dung */}
        {description && (
          <div className="text-sm text-gray-700 mb-8 leading-relaxed">
            {description}
          </div>
        )}

        <input
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          className="w-full p-3"
          placeholder="New Folder"
          type="text"
        />

        {/* Các nút hành động */}
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-[#0b57d0] hover:bg-blue-50 rounded-full transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(value)}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${confirmColorClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputConfirmModal;
