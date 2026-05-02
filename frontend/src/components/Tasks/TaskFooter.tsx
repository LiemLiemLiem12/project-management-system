"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  UserCircleIcon,
  CornerDownLeftIcon,
  XIcon,
  CheckIcon,
  PlayCircleIcon,
} from "lucide-react";

// 🚀 IMPORT STORE VÀ API Y NHƯ KANBAN
import { useCreateTask } from "@/services/task.service";
import { useProjectStore } from "@/store/project.store";
import { useTaskStore } from "@/store/task.store";

interface TaskFooterProps {
  visibleCount: number;
  totalCount: number;
  projectId: string; // 🚀 Yêu cầu thêm prop này để gọi API
}

export default function TaskFooter({
  visibleCount,
  totalCount,
  projectId,
}: TaskFooterProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const startDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // 🚀 LẤY DỮ LIỆU TỪ STORE
  const currentUserRole = useProjectStore((s) => s.currentUserRole);
  const members = useProjectStore((s) => s.members);
  const groups = useTaskStore((s) => s.groups);

  // 🚀 GỌI HOOK API
  const { mutate: createTask, isPending: isCreatingTask } =
    useCreateTask(projectId);

  // Phân quyền: Member không được tạo
  const canManage =
    currentUserRole === "Leader" || currentUserRole === "Moderator";

  // Lọc danh sách thành viên
  const selectedMemberInfo = members?.find((m) => m.user_id === selectedMember);
  const filteredMembers = members.filter((m) => {
    const name = (m as any).full_name || m.user_id;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        footerRef.current &&
        !footerRef.current.contains(event.target as Node)
      ) {
        setShowMemberPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || isCreatingTask) return;

    // 🚀 Mặc định thêm task vào cột đầu tiên (To Do)
    const defaultGroupId = groups?.[0]?.id;
    if (!defaultGroupId) {
      console.error("Không tìm thấy cột nào để thêm task!");
      return;
    }

    createTask(
      {
        title: newTaskTitle,
        group_task_id: defaultGroupId,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
        assignee_id: selectedMember || undefined,
      },
      {
        onSuccess: () => {
          handleCancel(); // Thành công thì đóng form
        },
      },
    );
  };

  const handleCancel = () => {
    setNewTaskTitle("");
    setStartDate("");
    setDueDate("");
    setSelectedMember(null);
    setShowMemberPopup(false);
    setSearchQuery("");
    setIsCreating(false);
  };

  // --- TRẠNG THÁI 1: CHƯA BẤM CREATE ---
  if (!isCreating) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
        {/* 🚀 CHỈ HIỂN THỊ NÚT CREATE NẾU LÀ LEADER/MODERATOR */}
        {canManage ? (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Create
          </button>
        ) : (
          <div /> /* Thẻ div rỗng để căn lề justify-between không bị hỏng */
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>
            {visibleCount} of {totalCount}
          </span>
        </div>
      </div>
    );
  }

  // --- TRẠNG THÁI 2: ĐANG NHẬP TASK ---
  return (
    <div
      ref={footerRef}
      className="p-3 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-[100]"
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 relative z-10">
        <textarea
          autoFocus
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full text-sm border-none focus:ring-0 focus:outline-none resize-none p-0 min-h-[50px] placeholder:text-gray-300 text-gray-700 bg-transparent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCreateTask();
            }
            if (e.key === "Escape") handleCancel();
          }}
        />

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 relative">
          <div className="flex items-center gap-2 text-gray-400">
            {/* START DATE */}
            <div
              className="relative flex items-center gap-1"
              title="Start Date"
            >
              <button
                type="button"
                onClick={() => startDateRef.current?.showPicker()}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${startDate ? "text-emerald-500" : ""}`}
              >
                <PlayCircleIcon size={16} />
              </button>
              <input
                type="date"
                ref={startDateRef}
                className="absolute opacity-0 pointer-events-none w-0"
                onChange={(e) => setStartDate(e.target.value)}
              />
              {startDate && (
                <span className="text-[10px] font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600">
                  Start: {startDate}
                </span>
              )}
            </div>

            {/* DUE DATE */}
            <div className="relative flex items-center gap-1" title="Due Date">
              <button
                type="button"
                onClick={() => dueDateRef.current?.showPicker()}
                className={`p-1 rounded hover:bg-gray-100 transition-colors ${dueDate ? "text-blue-500" : ""}`}
              >
                <CalendarIcon size={16} />
              </button>
              <input
                type="date"
                ref={dueDateRef}
                className="absolute opacity-0 pointer-events-none w-0"
                onChange={(e) => setDueDate(e.target.value)}
              />
              {dueDate && (
                <span className="text-[10px] font-medium bg-blue-50 px-1.5 py-0.5 rounded text-blue-600">
                  Due: {dueDate}
                </span>
              )}
            </div>

            {/* ASSIGNEE */}
            <div className="relative">
              <button
                onClick={() => setShowMemberPopup((v) => !v)}
                className={`p-1 rounded transition-colors flex items-center gap-1 ${
                  selectedMember
                    ? "text-blue-500"
                    : showMemberPopup
                      ? "text-blue-500 bg-blue-50"
                      : "hover:bg-gray-100"
                }`}
              >
                {selectedMemberInfo ? (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                    {(
                      (selectedMemberInfo as any).full_name ||
                      selectedMemberInfo.user_id
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                ) : (
                  <UserCircleIcon size={16} />
                )}
              </button>

              {/* POPUP ASSIGNEE */}
              {showMemberPopup && (
                <div className="absolute bottom-full left-0 mb-2 w-52 bg-white shadow-2xl border border-gray-200 rounded-lg z-[9999] p-2">
                  <p className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                    Assign to member
                  </p>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full text-xs px-2 py-1.5 mb-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />

                  <div
                    onClick={() => {
                      setSelectedMember(null);
                      setShowMemberPopup(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                      —
                    </div>
                    <span className="text-xs text-gray-400 italic">
                      Unassigned
                    </span>
                    {!selectedMember && (
                      <CheckIcon size={12} className="ml-auto text-blue-500" />
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {filteredMembers.map((m) => {
                      const displayName = (m as any).full_name || m.user_id;
                      return (
                        <div
                          key={m.user_id}
                          onClick={() => {
                            setSelectedMember(m.user_id);
                            setShowMemberPopup(false);
                          }}
                          className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-md cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 font-medium truncate">
                              {displayName}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {m.role}
                            </p>
                          </div>
                          {selectedMember === m.user_id && (
                            <CheckIcon
                              size={12}
                              className="text-blue-500 shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CANCEL & SUBMIT */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <XIcon size={16} />
            </button>
            <button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim() || isCreatingTask}
              className="p-1 bg-gray-100 hover:bg-blue-600 hover:text-white disabled:opacity-40 text-gray-400 rounded transition-all"
            >
              <CornerDownLeftIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
