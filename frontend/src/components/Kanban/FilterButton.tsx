"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, Search, User, Check, Tag } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho object state chứa các bộ lọc
type FilterState = {
  parent: string[];
  assignee: string[];
  label: string[];
};

export default function FilterButton() {
  // Các state quản lý UI (Đóng/mở, Tab hiện tại, Ô search)
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof FilterState>("parent");
  const [searchAssignee, setSearchAssignee] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. STATE DUY NHẤT chứa object key-value lưu trữ toàn bộ các lựa chọn filter
  const [filters, setFilters] = useState<FilterState>({
    parent: [],
    assignee: [],
    label: [],
  });

  // 2. HÀM HANDLER DÙNG CHUNG để toggle (chọn/bỏ chọn) cho bất kỳ tab nào
  const handleToggleFilter = (key: keyof FilterState, id: string | number) => {
    const stringId = String(id); // Đảm bảo id luôn là string để so sánh
    setFilters((prev) => {
      const currentList = prev[key];
      const isExist = currentList.includes(stringId);

      return {
        ...prev,
        [key]: isExist
          ? currentList.filter((item) => item !== stringId) // Bỏ chọn
          : [...currentList, stringId], // Chọn thêm
      };
    });
  };

  // --- MOCK DATA ---
  const parentList = [
    { id: "no-parent", name: "No parent" },
    { id: "DC-29", name: "Thực hiện - Frontend" },
    { id: "DC-30", name: "Thiết kế - UI/UX" },
  ];

  const assigneesList = [
    { id: "unassigned", name: "Unassigned", icon: User },
    { id: "liem", name: "Trần Thanh Liêm", initials: "TL" },
    { id: "na", name: "Na Ha", initials: "NH" },
  ];

  const labelList = [
    { id: "bug", name: "Bug", color: "border-red-500" },
    { id: "feature", name: "Feature", color: "border-blue-500" },
    { id: "enhancement", name: "Enhancement", color: "border-green-500" },
  ];

  // --- XỬ LÝ CLICK OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- RENDER FUNCTIONS CHO TỪNG TAB ---
  const renderParentTab = () => (
    <div className="p-4 flex flex-col h-full space-y-4">
      <div className="">
        {parentList.map((option) => (
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

            <span className="text-sm text-gray-700">{option.name}</span>
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
          placeholder="Search assignee"
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

              <div className="flex items-center justify-center w-4 h-4  rounded-sm ">
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

  const renderLabelTab = () => (
    <div className="p-4 flex flex-col h-full space-y-4">
      <div className="">
        {labelList.map((label) => (
          <label
            key={label.id}
            className="flex group items-center relative hover:bg-gray-200 p-2 space-x-3 cursor-pointer"
          >
            <div className="absolute left-0 top-0 h-full bg-blue-700 w-0.5 hidden group-hover:block" />
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.label.includes(label.id)}
              onChange={() => handleToggleFilter("label", label.id)}
            />
            <div className="flex text-sm items-center space-x-2">
              <span>{label.name}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  // Cấu hình các Tabs bên trái để render bằng loop cho gọn
  const TABS: { id: keyof FilterState; label: string }[] = [
    { id: "parent", label: "Parent" },
    { id: "assignee", label: "Assignee" },
    { id: "label", label: "Label" },
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex shadow h-full items-center space-x-2 relative px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-transparent rounded-md text-sm font-medium text-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        {/* Hiển thị số lượng filter đang active nếu muốn */}
        {Object.values(filters).flat().length > 0 && (
          <span className="ml-1 bg-blue-500 text-white absolute right-0 top-0 text-[10px] px-1.5 py-0.5 rounded-full">
            {Object.values(filters).flat().length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/3 md:-translate-x-1/2 z-30 mt-2 w-[400px] md:w-[550px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="flex h-[350px] overflow-auto">
            {/* Cột trái: Menu Tabs */}
            <div className="w-1/3 bg-white border-r border-gray-200 py-2">
              <ul className="space-y-1">
                {TABS.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        activeTab === tab.id
                          ? "bg-gray-200 font-medium text-gray-900"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột phải: Nội dung chi tiết */}
            <div className="w-2/3 bg-white">
              {activeTab === "parent" && renderParentTab()}
              {activeTab === "assignee" && renderAssigneeTab()}
              {activeTab === "label" && renderLabelTab()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
