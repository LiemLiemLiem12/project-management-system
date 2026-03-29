"use client";

import { tasks } from "@/store/Store";
import {
  TaskCheckbox,
  AvatarGroup,
  ReporterCell,
  PriorityBadge,
  StatusPill,
} from "./TaskAtoms";

// TaskRow đọc thẳng từ store qua taskId, không nhận data prop
export default function TaskRow({
  taskId,
  checked,
  onToggle,
}: {
  taskId: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const isDone = checked || task.completed;

  return (
    <>
      {/* Desktop row */}
      <div
        className="hidden md:grid items-center border-b border-gray-50 hover:bg-gray-50/60 group transition-colors"
        style={{
          gridTemplateColumns:
            "36px 1fr 100px 120px 130px 140px 110px 110px 36px",
        }}
      >
        {/* Checkbox */}
        <div className="px-3 py-3 flex items-center justify-center">
          <TaskCheckbox checked={isDone} onChange={onToggle} />
        </div>

        {/* Name + Code */}
        <div className="px-3 py-3">
          <p
            className={`text-sm font-medium text-gray-900 leading-snug ${isDone ? "line-through text-gray-400" : ""}`}
          >
            {task.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{task.taskCode}</p>
        </div>

        {/* Assignee */}
        <div className="px-3 py-3">
          <AvatarGroup ids={task.assigneeIds} max={2} />
        </div>

        {/* Reporter */}
        <div className="px-3 py-3">
          <ReporterCell name="Devrizal" />
        </div>

        {/* Priority */}
        <div className="px-3 py-3">
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Status */}
        <div className="px-3 py-3">
          <StatusPill status={task.status} />
        </div>

        {/* Created */}
        <div className="px-3 py-3">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {task.createdDate}
          </span>
        </div>

        {/* Due */}
        <div className="px-3 py-3">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {task.dueDate}
          </span>
        </div>

        {/* Actions */}
        <div className="px-2 py-3 flex items-center justify-center">
          <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3.5" r="1.2" fill="currentColor" />
              <circle cx="8" cy="8" r="1.2" fill="currentColor" />
              <circle cx="8" cy="12.5" r="1.2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div className="md:hidden border-b border-gray-100 px-4 py-3 hover:bg-gray-50/60 transition-colors">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <TaskCheckbox checked={isDone} onChange={onToggle} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium text-gray-900 leading-snug ${isDone ? "line-through text-gray-400" : ""}`}
            >
              {task.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{task.taskCode}</p>
            {/* Mobile badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={task.priority} />
              <StatusPill status={task.status} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <AvatarGroup ids={task.assigneeIds} max={2} />
              <span className="text-xs text-gray-400">{task.dueDate}</span>
            </div>
          </div>
          <button className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500 flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3.5" r="1.2" fill="currentColor" />
              <circle cx="8" cy="8" r="1.2" fill="currentColor" />
              <circle cx="8" cy="12.5" r="1.2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
