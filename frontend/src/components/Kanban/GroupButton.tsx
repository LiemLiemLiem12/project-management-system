"use client";

import React, { useState, useRef, useEffect } from "react";
import { LayoutList, Check } from "lucide-react";

export default function GroupButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("none");
  const menuRef = useRef<HTMLDivElement>(null);

  const groupOptions = [
    { id: "none", label: "None" },
    { id: "assignee", label: "Assignee" },
    { id: "subtask", label: "Subtask" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectGroup = (id: string) => {
    setSelectedGroup(id);
    setIsOpen(false);
  };

  const currentGroupLabel = groupOptions.find(
    (opt) => opt.id === selectedGroup,
  )?.label;

  return (
    <div className="relative inline-block text-left font-sans" ref={menuRef}>
      {/* Nút Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex shadow h-full items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-transparent rounded-md text-sm font-medium text-gray-700 transition-colors focus:outline-none"
      >
        <LayoutList className="w-4 h-4 text-gray-500" />
        <span>Group: {currentGroupLabel}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden py-1">
          {groupOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectGroup(option.id)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>{option.label}</span>
              {selectedGroup === option.id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
