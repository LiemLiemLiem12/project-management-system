"use client";

import { useState, useMemo, useEffect } from "react"; // <-- Thêm useEffect
import { useSpTasks, useSpGroups } from "@/store/spreadsheet.store";
import { useGetKanbanBoard } from "@/services/task.service";
import { useTaskStore } from "@/store/task.store";
import { useGetProjectMembers } from "@/services/project.service"; // <-- Thêm
import { useProjectStore } from "@/store/project.store"; // <-- Thêm
import { useAuthStore } from "@/store/auth.store"; // <-- Thêm

import TaskToolbar from "./TaskToolbar";
import TaskTableHeader from "./TaskTableHeader";
import TaskGroupSection from "./TaskGroupSection";
import TaskFooter from "./TaskFooter";

export default function SpreadsheetClient({
  projectId,
}: {
  projectId: string;
}) {
  const [search, setSearch] = useState("");

  // Fetch board — dùng lại hook kanban, data sync vào task.store
  useGetKanbanBoard(projectId);

  // ==========================================
  // LẤY DANH SÁCH THÀNH VIÊN ĐỂ DỊCH ID SANG TÊN
  // ==========================================
  const myUserId = useAuthStore((s) => s.user?.id);
  const setMembers = useProjectStore((s: any) => s.setMembers);
  const { data: membersData } = useGetProjectMembers(projectId);

  useEffect(() => {
    if (membersData) {
      const currentUser = myUserId
        ? membersData.find((m: any) => m.user_id === myUserId)
        : null;
      const role = currentUser?.role || null;
      setMembers(membersData, role);
    }
  }, [membersData, myUserId, setMembers]);
  // ==========================================

  const tasks = useSpTasks();
  const groups = useSpGroups();
  const isLoading = useTaskStore((s) => s.isLoading);

  const visibleCount = useMemo(() => {
    if (!search) return tasks.length;
    return tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.taskCode.toLowerCase().includes(search.toLowerCase()),
    ).length;
  }, [search, tasks]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col gap-3 w-full max-w-4xl px-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex items-start justify-center">
      <div className="w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <TaskToolbar search={search} onSearch={setSearch} />
          <TaskTableHeader />
          <div>
            {groups.map((group) => (
              <TaskGroupSection
                key={group.key}
                groupKey={group.key}
                groupLabel={group.label}
                isSuccess={group.isSuccess}
                search={search}
                projectId={projectId}
              />
            ))}
          </div>
          <TaskFooter visibleCount={visibleCount} totalCount={tasks.length} />
        </div>
      </div>
    </div>
  );
}
