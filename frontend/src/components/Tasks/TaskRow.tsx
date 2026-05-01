"use client";

import { useState, useRef, useEffect } from "react";
import {
  useSpTasks,
  useSpGroups,
  useAssignee,
  getGroupStyle,
} from "@/store/spreadsheet.store";
import { useUpdateTaskStatus, useDeleteTask } from "@/services/task.service";
import { useGetProjectMembers } from "@/services/project.service";
import DeleteTaskModal from "./DeleteTaskModal";
// 🚀 Thêm import này để check role
import { useProjectStore } from "@/store/project.store";

export default function TaskRow({
  taskId,
  checked,
  onToggle,
  projectId,
}: {
  taskId: string;
  checked: boolean;
  onToggle: () => void;
  projectId: string;
}) {
  const task = useSpTasks().find((t) => t.id === taskId);
  const groups = useSpGroups();
  const updateStatus = useUpdateTaskStatus(projectId);
  const { mutate: deleteTask } = useDeleteTask(projectId);

  // Lấy danh sách thành viên dự án
  const { data: membersData } = useGetProjectMembers(projectId);
  const projectMembers = (membersData as any[]) || [];

  // 🚀 Lấy role của user hiện tại
  const currentUserRole = useProjectStore((s) => s.currentUserRole);
  const isMember = currentUserRole === "Member";

  // Vẫn giữ hook màu sắc
  const assigneeColors = useAssignee(task?.assigneeIds?.[0]);
  const reporterColors = useAssignee(task?.reporterId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  if (!task) return null;

  // ==========================================
  // XỬ LÝ HIỂN THỊ TÊN NGƯỜI THỰC HIỆN
  // ==========================================
  const assigneeId = task.assigneeIds?.[0];
  const realAssignee = projectMembers.find(
    (m: any) => m.user_id === assigneeId,
  );

  const assigneeName =
    realAssignee?.full_name || assigneeColors?.name || assigneeId;
  const assigneeInitial = assigneeName
    ? String(assigneeName).charAt(0).toUpperCase()
    : "?";

  // ==========================================
  // XỬ LÝ HIỂN THỊ TÊN NGƯỜI TẠO
  // ==========================================
  const reporterId = task.reporterId;
  const realReporter = projectMembers.find(
    (m: any) => m.user_id === reporterId,
  );

  const reporterName =
    realReporter?.full_name || reporterColors?.name || reporterId;
  const reporterInitial = reporterName
    ? String(reporterName).charAt(0).toUpperCase()
    : "?";

  // Cấu hình trạng thái (Status)
  const statusStyle = getGroupStyle(task.status);
  const currentGroup = groups.find((g) => g.key === task.status);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatus(taskId, e.target.value);
  };

  return (
    <div
      className="hidden md:grid border-b border-gray-100 hover:bg-gray-50/70 transition-colors group"
      style={{
        gridTemplateColumns: "36px 1fr 100px 120px 140px 110px 110px 36px",
      }}
    >
      {/* Cột Checkbox */}
      <div className="px-3 py-3.5 flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-3.5 h-3.5 rounded cursor-pointer accent-indigo-600"
        />
      </div>

      {/* Cột Tên Task & Mã Task */}
      <div className="px-3 py-3.5 flex flex-col justify-center min-w-0">
        <span
          className={`text-sm font-medium text-gray-800 truncate ${
            currentGroup?.isSuccess ? "line-through text-gray-400" : ""
          }`}
        >
          {task.name}
        </span>
        <span className="text-[11px] text-gray-400 mt-0.5">
          {task.taskCode}
        </span>
      </div>

      {/* Cột Người thực hiện */}
      <div className="px-3 py-3.5 flex items-center gap-2 min-w-0">
        {assigneeId ? (
          <>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
              style={{
                background: assigneeColors?.color || "#F3F4F6",
                color: assigneeColors?.textColor || "#4B5563",
              }}
              title={assigneeName}
            >
              {assigneeInitial}
            </div>
            <span
              className="text-sm text-gray-700 truncate"
              title={assigneeName}
            >
              {assigneeName}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400 italic truncate">
            Unassigned
          </span>
        )}
      </div>

      {/* Cột Người tạo */}
      <div className="px-3 py-3.5 flex items-center gap-2 min-w-0">
        {reporterId ? (
          <>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
              style={{
                background: reporterColors?.color || "#F3F4F6",
                color: reporterColors?.textColor || "#4B5563",
              }}
              title={reporterName}
            >
              {reporterInitial}
            </div>
            <span
              className="text-sm text-gray-700 truncate"
              title={reporterName}
            >
              {reporterName}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400 truncate">—</span>
        )}
      </div>

      {/* Cột Trạng thái */}
      <div className="px-3 py-3.5 flex items-center min-w-0">
        <div className="relative w-full max-w-[120px]">
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="w-full truncate appearance-none text-xs font-medium px-3 py-1.5 pr-6 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {groups.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: statusStyle.text }}
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Cột Ngày bắt đầu */}
      <div className="px-3 py-3.5 flex items-center min-w-0">
        <span className="text-sm text-gray-500 truncate">
          {task.startDate || "—"}
        </span>
      </div>

      {/* Cột Hạn chót */}
      <div className="px-3 py-3.5 flex items-center min-w-0">
        <span className="text-sm text-gray-500 truncate">
          {task.dueDate || "—"}
        </span>
      </div>

      {/* Cột Thao tác */}
      <div
        className="px-2 py-3.5 flex items-center justify-center relative min-w-0"
        ref={menuRef}
      >
        {/* 🚀 ẨN HOÀN TOÀN NẾU LÀ MEMBER */}
        {!isMember && (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded hover:bg-gray-200 text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.2" fill="currentColor" />
              <circle cx="8" cy="8" r="1.2" fill="currentColor" />
              <circle cx="8" cy="13" r="1.2" fill="currentColor" />
            </svg>
          </button>
        )}

        {menuOpen && !isMember && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => {
                setMenuOpen(false);
                setShowDeleteModal(true);
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <DeleteTaskModal
          taskCode={task.taskCode}
          onClose={() => setShowDeleteModal(false)}
          onArchive={() => setShowDeleteModal(false)}
          onConfirm={() => {
            deleteTask(taskId);
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
}
