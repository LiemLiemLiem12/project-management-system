"use client";

import { useState, useMemo } from "react";
import { tasks, taskGroups } from "@/store/Store";
import TaskToolbar from "@/components/Tasks/TaskToolbar";
import TaskTableHeader from "@/components/Tasks/TaskTableHeader";
import TaskGroupSection from "@/components/Tasks/TaskGroupSection";
import TaskFooter from "@/components/Tasks/TaskFooter";

export default function TaskBoardPage() {
  const [search, setSearch] = useState("");

  // Đếm số task visible để hiển thị ở footer
  const visibleCount = useMemo(() => {
    if (!search) return tasks.length;
    return tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.taskCode.toLowerCase().includes(search.toLowerCase()),
    ).length;
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        {/* Card wrapper */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <TaskToolbar search={search} onSearch={setSearch} />

          {/* Table header — desktop only */}
          <TaskTableHeader />

          {/* Groups */}
          <div>
            {taskGroups.map((group) => (
              <TaskGroupSection
                key={group.key}
                groupKey={group.key}
                search={search}
              />
            ))}
          </div>

          {/* Footer */}
          <TaskFooter visibleCount={visibleCount} />
        </div>
      </div>
    </div>
  );
}
