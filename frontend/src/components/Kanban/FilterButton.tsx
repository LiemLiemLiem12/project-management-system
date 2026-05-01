"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, Search, User } from "lucide-react";

// 🚀 IMPORT STORE CỦA ÔNG VÀO ĐÂY
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

  // ========================================================
  // 🚀 LẤY DỮ LIỆU THẬT TỪ STORE ĐỂ HIỂN THỊ LÊN FILTER
  // ========================================================
  const groups = useTaskStore((s) => s.groups) || [];
  const members = useProjectStore((s: any) => s.members) || [];

  // 1. Map danh sách Parent từ tất cả các Task đang có trên bảng Kanban
  const parentList = groups
    .flatMap((g) => g.tasks)
    .map((t: any) => ({
      id: t.id,
      name: t.title || t.name || t.id,
      code: t.taskCode || "",
    }));

  // 2. Map danh sách Assignee từ API Project Members
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
  // ========================================================

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

      <div className="flex-1 overflow-y-auto">
        {parentList
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchParent.toLowerCase()) ||
              p.code.toLowerCase().includes(searchParent.toLowerCase()),
          )
          .map((option) => (
            <label
              key={option.id}
              className="group flex relative items-center hover:bg-gray-200 p-2 space-x-3 cursor-pointer"
            >
              <div className="absolute left-0 top-0 h-full bg-blue-700 w-0.5 hidden group-hover:block" />
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={filters.parent.includes(String(option.id))}
                onChange={() => handleToggleFilter("parent", option.id)}
              />
              <span className="text-sm text-gray-700 flex flex-col">
                <span className="font-medium text-xs text-gray-500">
                  {option.code}
                </span>
                <span>{option.name}</span>
              </span>
            </label>
          ))}
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

      <div className="flex-1 overflow-y-auto">
        {assigneesList
          .filter((a) =>
            a.name.toLowerCase().includes(searchAssignee.toLowerCase()),
          )
          .map((assignee) => (
            <label
              key={assignee.id}
              className="flex p-2 relative items-center hover:bg-gray-200 space-x-3 cursor-pointer group"
            >
              <div className="absolute left-0 top-0 h-full bg-blue-700 w-0.5 hidden group-hover:block" />

              <div className="flex items-center justify-center w-4 h-4 rounded-sm">
                <input
                  type="checkbox"
                  className="size-full text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={filters.assignee.includes(assignee.id)}
                  onChange={() => handleToggleFilter("assignee", assignee.id)}
                />
              </div>

              {assignee.icon ? (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <assignee.icon className="w-4 h-4" />
                </div>
              ) : assignee.avatar ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-medium">
                  {assignee.initials}
                </div>
              )}

              <span className="text-sm text-gray-700">{assignee.name}</span>
            </label>
          ))}
      </div>
    </div>
  );

  const TABS: { id: keyof FilterState; label: string }[] = [
    { id: "parent", label: "Parent Task" },
    { id: "assignee", label: "Assignee" },
  ];

  const activeFiltersCount = Object.values(filters).flat().length;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex shadow h-full items-center space-x-2 relative px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-transparent rounded-md text-sm font-medium text-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 bg-blue-500 text-white absolute -right-1 -top-1 text-[10px] px-1.5 py-0.5 rounded-full border border-white">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 md:-left-4 z-30 mt-2 w-[400px] md:w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="flex h-[300px] overflow-auto">
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 py-2">
              <ul className="space-y-1">
                {TABS.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        activeTab === tab.id
                          ? "bg-white font-medium text-blue-600 border-l-2 border-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-2/3 bg-white">
              {activeTab === "parent" && renderParentTab()}
              {activeTab === "assignee" && renderAssigneeTab()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
