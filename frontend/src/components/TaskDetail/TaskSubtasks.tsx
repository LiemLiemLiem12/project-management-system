"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  CornerDownLeft,
  ChevronDown,
  Copy,
} from "lucide-react";

// Mock data để test tính năng search
const mockExistingTasks = [
  { id: "DC-15", title: "Sidebar" },
  { id: "DC-16", title: "Header Navigation" },
  { id: "DC-20", title: "Search functionality" },
  { id: "DC-22", title: "User Settings UI" },
];

export default function TaskSubtasks() {
  const [subtasks, setSubtasks] = useState<{ id: string; title: string }[]>([]);

  // Quản lý trạng thái hiển thị khu vực thêm mới
  const [isAdding, setIsAdding] = useState(true); // Mặc định mở nếu list trống

  // Quản lý chế độ: 'create' (tạo mới) hoặc 'search' (tìm task có sẵn)
  const [mode, setMode] = useState<"create" | "search">("create");
  const [inputValue, setInputValue] = useState("");

  // Lọc task có sẵn dựa trên text đang gõ
  const matchedTasks = mockExistingTasks.filter((task) =>
    task.title.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Hàm xử lý thêm subtask vào list
  const handleAddSubtask = (id: string, title: string) => {
    setSubtasks([...subtasks, { id, title }]);
    setInputValue("");
    setMode("create");
    setIsAdding(false);
  };

  return (
    <section id="section-subtasks" className="scroll-mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-1">
          Subtasks
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-slate-500 hover:text-slate-800"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Khu vực Nhập liệu / Tìm kiếm */}
      {isAdding && (
        <div className="relative">
          {mode === "create" ? (
            // ================= MODE 1: CREATE SUBTASK =================
            <div className="space-y-2">
              <div className="flex items-center p-1 border border-slate-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white transition-all">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      handleAddSubtask(
                        `NEW-${Date.now().toString().slice(-4)}`,
                        inputValue,
                      );
                    }
                  }}
                  placeholder="What needs to be done?"
                  className="flex-1 py-1.5 px-3 text-sm focus:outline-none bg-transparent"
                />

                {/* Nút giả lập chọn loại hình Task bên phải */}
                <div className="flex items-center gap-1 px-2 py-1 mr-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100">
                  <Copy size={12} className="text-blue-500" />
                  Subtask
                  <ChevronDown size={12} />
                </div>

                <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                  <CornerDownLeft size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    setMode("search");
                    setInputValue("");
                  }}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  <Search size={14} />
                  Choose existing
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // ================= MODE 2: SEARCH EXISTING =================
            <div className="relative">
              <div className="flex items-center p-1 border border-blue-500 ring-1 ring-blue-500 rounded-md bg-white">
                <button
                  onClick={() => setMode("create")}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                >
                  <ArrowLeft size={16} />
                </button>
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search existing tasks..."
                  className="flex-1 py-1.5 px-2 text-sm focus:outline-none bg-transparent"
                />
                <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                  <CornerDownLeft size={14} />
                </button>
              </div>

              {/* Dropdown Gợi ý */}
              {inputValue && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 overflow-hidden">
                  {matchedTasks.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 pb-1 text-xs font-bold text-slate-500">
                        Matching work items
                      </div>
                      {matchedTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleAddSubtask(task.id, task.title)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                        >
                          <Copy size={14} className="text-blue-500" />
                          <span className="text-slate-500">{task.id}</span>
                          <span className="text-slate-900">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nút tạo mới từ text search */}
                  <div
                    onClick={() =>
                      handleAddSubtask(
                        `NEW-${Date.now().toString().slice(-4)}`,
                        inputValue,
                      )
                    }
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <Plus size={16} />
                    Create a work item for "{inputValue}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {subtasks.length > 0 && (
        <div className="border border-gray-200 overflow-hidden mb-3">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-200 text-slate-500 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold w-1/2">Task</th>
                <th className="p-3 font-semibold w-1/2 whitespace-nowrap">
                  Assignee
                </th>
                <th className="p-3 font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>

            <tbody className="divide-x divide-y divide-gray-200 border-b border-gray-200">
              {subtasks.map((task, index) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-slate-50 transition-colors group"
                >
                  <td className="p-3 w-1/2 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <Copy size={14} className="text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-slate-500 whitespace-nowrap">
                        {task.id}
                      </span>
                      <span className="text-slate-900 truncate max-w-[200px] lg:max-w-md">
                        {task.title}
                      </span>
                    </div>
                  </td>

                  {/* Cột Assignee: Co lại vừa vặn nội dung */}
                  <td className="p-3 w-1/2 whitespace-nowrap border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                        AR
                      </div>
                      <span className="text-slate-600 text-sm font-medium">
                        Alex R.
                      </span>
                    </div>
                  </td>

                  {/* Cột Status: Co lại vừa vặn nội dung */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex justify-center">
                      <span className="px-2.5 py-1 text-xs font-semibold border border-gray-200 rounded-md bg-white text-slate-600 flex items-center gap-1.5 shadow-sm">
                        To Do
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
