"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, Search, User } from "lucide-react";
import { useTaskStore } from "@/store/task.store";
import { useProjectStore } from "@/store/project.store";

export type FilterState = {
  parent: string[];
  assignee: string[];
};

interface FilterButtonProps {
  onFilterChange?: (filters: FilterState) => void;
}

export default function FilterButton({ onFilterChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof FilterState>("assignee");
  const [searchAssignee, setSearchAssignee] = useState("");
  const [searchParent, setSearchParent] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    parent: [],
    assignee: [],
  });

  const groups = useTaskStore((s) => s.groups) || [];
  const members = useProjectStore((s: any) => s.members) || [];

  const parentList = groups
    .flatMap((g) => g.tasks)
    .map((t: any) => ({
      id: t.id,
      name: t.title || t.name || t.id,
      code: t.taskCode || "",
    }));

  const assigneesList = [
    { id: "unassigned", name: "Unassigned", icon: User },
    ...members.map((m: any) => ({
      id: m.user_id,
      name: m.full_name || m.user_id || "Unknown",
      initials: String(m.full_name || m.user_id || "U")
        .charAt(0)
        .toUpperCase(),
      avatar: m.avatar || m.avatar_url,
    })),
  ];

  useEffect(() => {
    if (onFilterChange) onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleToggleFilter = (key: keyof FilterState, id: string | number) => {
    const stringId = String(id);
    setFilters((prev) => {
      const currentList = prev[key];
      const isExist = currentList.includes(stringId);
      return {
        ...prev,
        [key]: isExist
          ? currentList.filter((item) => item !== stringId)
          : [...currentList, stringId],
      };
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderParentTab = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search parent task..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchParent}
          onChange={(e) => setSearchParent(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto max-h-[250px]">
        {parentList.length > 0 ? (
          parentList
            .filter((p) =>
              p.name.toLowerCase().includes(searchParent.toLowerCase()),
            )
            .map((option) => (
              <label
                key={option.id}
                className="group flex items-center hover:bg-gray-100 p-2 rounded-md cursor-pointer space-x-3"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={filters.parent.includes(String(option.id))}
                  onChange={() => handleToggleFilter("parent", option.id)}
                />
                <span className="text-sm text-gray-700 truncate">
                  {option.name}
                </span>
              </label>
            ))
        ) : (
          <p className="text-xs text-center text-gray-400 mt-4">
            No tasks found
          </p>
        )}
      </div>
    </div>
  );

  const renderAssigneeTab = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search assignee..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchAssignee}
          onChange={(e) => setSearchAssignee(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto max-h-[250px]">
        {assigneesList
          .filter((a) =>
            a.name.toLowerCase().includes(searchAssignee.toLowerCase()),
          )
          .map((assignee) => (
            <label
              key={assignee.id}
              className="flex items-center hover:bg-gray-100 p-2 rounded-md cursor-pointer space-x-3"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={filters.assignee.includes(assignee.id)}
                onChange={() => handleToggleFilter("assignee", assignee.id)}
              />
              <span className="text-sm text-gray-700">{assignee.name}</span>
            </label>
          ))}
      </div>
    </div>
  );

  const activeFiltersCount = Object.values(filters).flat().length;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium text-gray-700 transition-all"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        /* 🚀 FIX GIAO DIỆN CHÍNH: 
           - Thay right-0 bằng left-0 để popup mở sang phải, không bị mất hình.
           - Thêm min-w-[450px] để không bị bóp méo giao diện.
        */
        <div className="absolute left-0 top-full mt-2 min-w-[450px] bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] flex overflow-hidden origin-top-left transition-all">
          {/* Cột trái: Tabs điều hướng */}
          <div className="w-[140px] bg-gray-50 border-r border-gray-200 py-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab("parent")}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                activeTab === "parent"
                  ? "bg-white text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Parent Task
            </button>
            <button
              onClick={() => setActiveTab("assignee")}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                activeTab === "assignee"
                  ? "bg-white text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Assignee
            </button>
          </div>

          {/* Cột phải: Nội dung danh sách lọc */}
          <div className="flex-1 bg-white min-h-[300px] max-h-[400px] flex flex-col">
            {activeTab === "parent" ? renderParentTab() : renderAssigneeTab()}
          </div>
        </div>
      )}
    </div>
  );
}
