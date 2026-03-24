"use client";

import React, { useState, useRef, useEffect } from "react";

// Dữ liệu mẫu ban đầu
const INITIAL_AVAILABLE_LABELS = [
  { id: "1", text: "Figma", color: "border-pink-400 text-gray-800" },
  { id: "2", text: "Meeting", color: "border-purple-400 text-gray-800" },
];

const DEFAULT_SELECTED = [
  { id: "0", text: "Code_FE", color: "border-red-400 text-gray-800" },
];

export default function LabelMemberChoice() {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedLabels, setSelectedLabels] = useState(DEFAULT_SELECTED);
  const [availableLabels, setAvailableLabels] = useState(
    INITIAL_AVAILABLE_LABELS,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setInputValue("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động focus vào input khi mở
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRemoveLabel = (idToRemove: string) => {
    setSelectedLabels(
      selectedLabels.filter((label) => label.id !== idToRemove),
    );
  };

  const handleAddLabel = (label: any) => {
    if (!selectedLabels.find((l) => l.id === label.id)) {
      setSelectedLabels([...selectedLabels, label]);
    }
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleCreateNewLabel = () => {
    if (!inputValue.trim()) return;
    const newLabel = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      color: "border-blue-400 text-gray-800", // Màu mặc định cho label mới
    };
    setAvailableLabels([...availableLabels, newLabel]);
    setSelectedLabels([...selectedLabels, newLabel]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exactMatch = availableLabels.find(
        (l) => l.text.toLowerCase() === inputValue.trim().toLowerCase(),
      );

      if (exactMatch) {
        handleAddLabel(exactMatch);
      } else if (inputValue.trim()) {
        handleCreateNewLabel();
      }
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      selectedLabels.length > 0
    ) {
      // Xóa label cuối cùng nếu ấn backspace khi input rỗng
      handleRemoveLabel(selectedLabels[selectedLabels.length - 1].id);
    }
  };

  const clearAll = () => {
    setSelectedLabels([]);
    setInputValue("");
  };

  // Lọc labels dựa trên text đang nhập
  const filteredLabels = availableLabels.filter((label) =>
    label.text.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Kiểm tra xem text đang nhập có trùng hoàn toàn với label nào chưa
  const hasExactMatch = availableLabels.some(
    (label) => label.text.toLowerCase() === inputValue.trim().toLowerCase(),
  );
  const showCreateNew = inputValue.trim().length > 0 && !hasExactMatch;

  return (
    <div className="relative w-full font-sans text-sm" ref={containerRef}>
      {/* TRẠNG THÁI HIỂN THỊ (HÌNH 1) */}
      {!isEditing ? (
        <div
          className="flex flex-wrap gap-2 cursor-text min-h-[32px] items-center"
          onClick={() => setIsEditing(true)}
        >
          {selectedLabels.length === 0 ? (
            <span className="text-gray-400 italic">Click to add label...</span>
          ) : (
            selectedLabels.map((label) => (
              <span
                key={label.id}
                className={`px-2 py-0.5 border rounded-md bg-white ${label.color}`}
              >
                {label.text}
              </span>
            ))
          )}
        </div>
      ) : (
        /* TRẠNG THÁI EDITING (HÌNH 2) */
        <div className="flex items-center flex-wrap gap-1 p-1 border-2 border-blue-500 rounded-md bg-white shadow-sm">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className={`flex items-center gap-1 px-2 py-0.5 border rounded-md bg-white ${label.color}`}
            >
              {label.text}
              <button
                type="button"
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLabel(label.id);
                }}
              >
                &times;
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            className="flex-grow min-w-[60px] outline-none px-1 py-0.5 bg-transparent"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Nút Clear All & Dropdown icon */}
          <div className="flex items-center text-gray-500 ml-auto pr-1 gap-1">
            <button
              onClick={clearAll}
              className="hover:text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              title="Clear all"
            >
              &times;
            </button>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* DROPDOWN MENU */}
      {isEditing && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 overflow-hidden">
          <div className="p-2 text-xs font-semibold text-gray-500 bg-gray-50">
            All labels
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredLabels.map((label) => {
              const isSelected = selectedLabels.some((l) => l.id === label.id);
              if (isSelected) return null; // Ẩn label đã chọn khỏi dropdown

              return (
                <div
                  key={label.id}
                  className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => handleAddLabel(label)}
                >
                  <span
                    className={`px-2 py-0.5 border rounded-md bg-white ${label.color}`}
                  >
                    {label.text}
                  </span>
                </div>
              );
            })}

            {/* HIỂN THỊ (NEW) KHI TYPING LABEL MỚI */}
            {showCreateNew && (
              <div
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2"
                onClick={handleCreateNewLabel}
              >
                <span className="text-gray-400 italic">(new)</span>
                <span className="px-2 py-0.5 border border-blue-400 rounded-md bg-white">
                  {inputValue}
                </span>
              </div>
            )}

            {filteredLabels.length === 0 && !showCreateNew && (
              <div className="px-3 py-2 text-gray-400 text-sm italic">
                No labels found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
