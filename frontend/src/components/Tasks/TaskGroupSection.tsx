"use client";

import { useState } from "react";
import { useSpTasksByGroup, getGroupStyle } from "@/store/spreadsheet.store";
import TaskRow from "./TaskRow";

interface TaskGroupSectionProps {
  groupKey: string;
  groupLabel: string;
  isSuccess: boolean;
  search: string;
  projectId: string;
}

export default function TaskGroupSection({
  groupKey,
  groupLabel,
  isSuccess,
  search,
  projectId,
}: TaskGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const allTasks = useSpTasksByGroup(groupKey);
  const filtered = search
    ? allTasks.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.taskCode.toLowerCase().includes(search.toLowerCase()),
      )
    : allTasks;

  if (search && filtered.length === 0) return null;

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
      {/* Group header */}
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

      {/* Task rows */}
      {!collapsed && (
        <div>
          {filtered.map((task) => (
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
