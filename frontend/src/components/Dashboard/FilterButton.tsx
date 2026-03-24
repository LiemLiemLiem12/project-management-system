"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, Search, User, Check } from "lucide-react";

export default function FilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assignee");

  const [searchAssignee, setSearchAssignee] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const assigneesList = [
    { id: "unassigned", name: "Unassigned", icon: User },
    { id: "liem", name: "Trần Thanh Liêm", initials: "TL" },
    { id: "na", name: "Na Ha", initials: "NH" },
  ];

  const dateOptions = [
    { id: "today", label: "Today" },
    { id: "this_week", label: "This Week" },
    { id: "this_month", label: "This month" },
    { id: "this_year", label: "This Year" },
    { id: "range", label: "Range" },
  ];

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const renderAssigneeTab = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search assignee"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchAssignee}
          onChange={(e) => setSearchAssignee(e.target.value)}
        />
      </div>

      {/* Danh sách Assignee */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {assigneesList
          .filter((a) =>
            a.name.toLowerCase().includes(searchAssignee.toLowerCase()),
          )
          .map((assignee) => (
            <label
              key={assignee.id}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-4 h-4 border border-gray-400 rounded-sm group-hover:border-blue-500">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selectedAssignees.includes(assignee.id)}
                  onChange={() => toggleAssignee(assignee.id)}
                />
                {selectedAssignees.includes(assignee.id) && (
                  <Check className="w-3 h-3 text-blue-600 font-bold" />
                )}
              </div>

              {/* Avatar giả lập */}
              {assignee.icon ? (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <assignee.icon className="w-4 h-4" />
                </div>
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

  const renderCreatedTab = () => (
    <div className="p-4 flex flex-col h-full space-y-4">
      <div className="space-y-3">
        {dateOptions.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name="created_date"
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              checked={selectedDateFilter === option.id}
              onChange={() => setSelectedDateFilter(option.id)}
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Date Range Picker (Hiển thị khi chọn Range) */}
      {selectedDateFilter === "range" && (
        <div className="mt-4 p-3 bg-gray-50 border rounded-md space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Nút Filter */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-transparent rounded-md text-sm font-medium text-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[550px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
          <div className="flex h-[350px] overflow-auto">
            <div className="w-1/3 bg-white border-r border-gray-200 py-2">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab("assignee")}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === "assignee"
                        ? "bg-gray-200 font-medium text-gray-900"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Assignee
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("created")}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeTab === "created"
                        ? "bg-gray-200 font-medium text-gray-900"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Created
                  </button>
                </li>
              </ul>
            </div>

            {/* Cột phải: Nội dung chi tiết của bộ lọc */}
            <div className="w-2/3 bg-white">
              {activeTab === "assignee" && renderAssigneeTab()}
              {activeTab === "created" && renderCreatedTab()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
