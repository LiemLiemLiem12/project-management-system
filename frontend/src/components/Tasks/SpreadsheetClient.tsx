"use client";

import { useState, useMemo, useEffect } from "react";
import { useSpTasks, useSpGroups } from "@/store/spreadsheet.store";
import { useGetKanbanBoard } from "@/services/task.service";
import { useTaskStore } from "@/store/task.store";
import { useGetProjectMembers } from "@/services/project.service";
import { useProjectStore } from "@/store/project.store";
import { useAuthStore } from "@/store/auth.store";

import TaskToolbar from "./TaskToolbar";
import TaskTableHeader from "./TaskTableHeader";
import TaskGroupSection from "./TaskGroupSection";
import TaskFooter from "./TaskFooter";

// 🚀 Import FilterState từ file FilterButton
import { FilterState } from "@/components/Kanban/FilterButton";

export default function SpreadsheetClient({
  projectId,
}: {
  projectId: string;
}) {
  const [search, setSearch] = useState("");

  // 🚀 TẠO STATE LƯU TRỮ BỘ LỌC
  const [filters, setFilters] = useState<FilterState>({
    parent: [],
    assignee: [],
  });

  // Fetch board — dùng lại hook kanban, data sync vào task.store
  useGetKanbanBoard(projectId);

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

  // 🚀 TÍNH TOÁN LẠI SỐ LƯỢNG TASK HIỂN THỊ SAU KHI LỌC
  const visibleCount = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Lọc theo Search (Tên hoặc Mã Task)
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.taskCode.toLowerCase().includes(search.toLowerCase());

      // 2. Lọc theo Assignee
      const matchAssignee =
        filters.assignee.length === 0 || // Nếu không chọn filter assignee nào thì pass
        (filters.assignee.includes("unassigned") &&
          (!t.assigneeIds || t.assigneeIds.length === 0)) || // Chọn unassigned
        (t.assigneeIds &&
          t.assigneeIds.some((id) => filters.assignee.includes(String(id)))); // Kiểm tra có id người dùng không

      // 3. Lọc theo Parent (Nếu sau này API có trường parent_id)
      // const matchParent = filters.parent.length === 0 || (t.parent_id && filters.parent.includes(String(t.parent_id)));

      return matchSearch && matchAssignee; // Thêm && matchParent nếu có dữ liệu parent
    }).length;
  }, [search, tasks, filters]);

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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* 🚀 TRUYỀN HÀM setFilters VÀO TOOLBAR */}
          <TaskToolbar
            search={search}
            onSearch={setSearch}
            onFilterChange={setFilters}
          />

          <TaskTableHeader />
          <div>
            {groups.map((group) => (
              <TaskGroupSection
                key={group.key}
                groupKey={group.key}
                groupLabel={group.label}
                isSuccess={group.isSuccess}
                search={search}
                filters={filters} // 🚀 TRUYỀN FILTERS XUỐNG GROUP ĐỂ NÓ ẨN TASK
                projectId={projectId}
              />
            ))}
          </div>

          {/* Nhớ thêm projectId vào TaskFooter như fix lỗi ở trên nha */}
          <TaskFooter
            visibleCount={visibleCount}
            totalCount={tasks.length}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}
