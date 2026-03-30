"use client";

import { useState } from "react";
import { tasks, Task } from "@/store/Store";

const tagStyles: Record<Task["tag"], string> = {
  DEVELOPMENT: "bg-blue-50 text-blue-600",
  MARKETING: "bg-purple-50 text-purple-600",
  ADMIN: "bg-gray-100 text-gray-500",
};

function TagBadge({ tag }: { tag: Task["tag"] }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${tagStyles[tag]}`}
    >
      {tag}
    </span>
  );
}

function DueDate({ due, urgent }: { due: string; urgent?: boolean }) {
  return (
    <span
      className={`flex items-center gap-1 text-[11px] ${urgent ? "text-red-500" : "text-gray-400"}`}
    >
      <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none">
        <rect
          x="1"
          y="2"
          width="12"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M4 1v2M10 1v2M1 5h12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {due}
    </span>
  );
}

function TaskRow({ id }: { id: string }) {
  const task = tasks.find((t) => t.id === id)!;
  const [checked, setChecked] = useState(task.completed);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group">
      <button
        onClick={() => setChecked(!checked)}
        className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 transition-all duration-150 flex items-center justify-center
          ${checked ? "bg-blue-500 border-blue-500" : "border-gray-300 hover:border-blue-400"}`}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
            <path
              d="M1 4l3 3 5-6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm text-gray-800 leading-snug ${checked ? "line-through text-gray-400" : ""}`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <TagBadge tag={task.tag} />
          <DueDate due={task.due} urgent={task.urgent} />
        </div>
      </div>
    </div>
  );
}

export default function MyTasks() {
  const openCount = tasks.filter((t) => !t.completed).length;
  const displayedTasks = tasks.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">My Tasks</h2>
        <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
          {openCount} OPEN
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {displayedTasks.map((t) => (
          <TaskRow key={t.id} id={t.id} />
        ))}
      </div>

      {tasks.length > 3 && (
        <button className="w-full mt-4 py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all duration-150">
          VIEW ALL {tasks.length} TASKS
        </button>
      )}
    </div>
  );
}
