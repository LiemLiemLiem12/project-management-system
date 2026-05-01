"use client";

import React, { useState } from "react";
import { useSpTasksByGroup, getGroupStyle } from "@/store/spreadsheet.store";
import TaskRow from "./TaskRow";
import { FilterState } from "@/components/Kanban/FilterButton";

interface TaskGroupSectionProps {
  groupKey: string;
  groupLabel: string;
  isSuccess: boolean;
  search: string;
  filters: FilterState;
  projectId: string;
}

export default function TaskGroupSection({
  groupKey,
  groupLabel,
  isSuccess,
  search,
  filters,
  projectId,
}: TaskGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const allTasks = useSpTasksByGroup(groupKey);

  // ========================================================
  // 🚀 LÕI LỌC DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ VỚI DỮ LIỆU THẬT
  // ========================================================
  const filtered = allTasks.filter((t: any) => {
    const taskName = t.name || t.title || "";
    const taskCode = t.taskCode || t.id || "";

    // 1. Khớp Search
    const matchSearch =
      !search ||
      taskName.toLowerCase().includes(search.toLowerCase()) ||
      taskCode.toLowerCase().includes(search.toLowerCase());

    // 2. Khớp Assignee (Lấy từ array assigneeIds hoặc chuỗi assignee_id)
    const tAssignees = t.assigneeIds || (t.assignee_id ? [t.assignee_id] : []);
    const matchAssignee =
      filters.assignee.length === 0 ||
      (filters.assignee.includes("unassigned") && tAssignees.length === 0) ||
      tAssignees.some((id: string) => filters.assignee.includes(String(id)));

    // 3. Khớp Parent (So sánh parent_id của Task với danh sách Parent được chọn)
    const matchParent =
      filters.parent.length === 0 ||
      filters.parent.includes(String(t.parent_id));

    return matchSearch && matchAssignee && matchParent;
  });

  const isFiltering =
    search || filters.assignee.length > 0 || filters.parent.length > 0;
  if (isFiltering && filtered.length === 0) return null;

  const toggle = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const style = getGroupStyle(groupKey);

  return (
    <div>
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/80 cursor-pointer select-none hover:bg-gray-100/60 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          className="text-gray-400 transition-transform duration-200"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        <span
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: style.bg, color: style.text }}
        >
          {groupLabel}
        </span>

        <span className="text-xs text-gray-400">({filtered.length} tasks)</span>

        {isSuccess && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 uppercase">
            Done
          </span>
        )}
      </div>

      {!collapsed && (
        <div>
          {filtered.map((task: any) => (
            <TaskRow
              key={task.id}
              taskId={task.id}
              checked={checkedIds.has(task.id)}
              onToggle={() => toggle(task.id)}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
