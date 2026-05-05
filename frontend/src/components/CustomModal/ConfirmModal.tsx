"use client";

import React, { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmColorClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "Huỷ",
  confirmText = "Xác nhận",
  confirmColorClass = "bg-[#c5221f] hover:bg-[#a51d1a] text-white", // Màu đỏ mặc định giống hình
}) => {
  // Ngăn cuộn trang nền khi Modal đang mở
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

        {/* Các nút hành động */}
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-[#0b57d0] hover:bg-blue-50 rounded-full transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${confirmColorClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
