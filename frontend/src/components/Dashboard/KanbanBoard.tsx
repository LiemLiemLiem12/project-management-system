"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import KanbanGroup from "./KanbanGroup";
import { useTaskStore } from "@/store/task.store";
import {
  useGetKanbanBoard,
  useMoveTask,
  useReorderGroups,
  useCreateGroup,
} from "@/services/task.service";
import { useGetProjectMembers } from "@/services/project.service";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";

// 🚀 1. Import Toolbar và FilterStatep
import TaskToolbar from "@/components/Tasks/TaskToolbar";
import { FilterState } from "@/components/Kanban/FilterButton";

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  // 🚀 2. TẠO STATE ĐỂ LƯU CHỮ LỌC (Y HỆT SPREADSHEET)
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    parent: [],
    assignee: [],
  });

  const groups = useTaskStore((s) => s.groups);
  const isLoading = useTaskStore((s) => s.isLoading);
  const error = useTaskStore((s) => s.error);

  const myUserId = useAuthStore((s) => s.user?.id);
  const setMembers = useProjectStore((s) => s.setMembers);

  useGetKanbanBoard(projectId);
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

  const moveTask = useMoveTask(projectId);
  const reorderGroups = useReorderGroups(projectId);
  const { mutate: createGroup } = useCreateGroup(projectId);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "COLUMN") {
      const ordered_ids = groups.map((g) => g.id);
      const [removed] = ordered_ids.splice(source.index, 1);
      ordered_ids.splice(destination.index, 0, removed);
      reorderGroups(ordered_ids);
      return;
    }

    if (type === "TASK") {
      moveTask({
        taskId: draggableId,
        fromGroupId: source.droppableId,
        toGroupId: destination.droppableId,
        fromIndex: source.index,
        toIndex: destination.index,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 h-full items-start p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#F1F2F4] rounded-xl w-[300px] h-48 shrink-0 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    // 🚀 1. Ép chiều cao toàn bộ bảng bằng màn hình (trừ đi khoảng header bên trên)
    <div className="flex flex-col h-[calc(100vh-130px)] w-full bg-white">
      <TaskToolbar
        search={search}
        onSearch={setSearch}
        onFilterChange={setFilters}
      />

      {/* Vùng chứa board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* 🚀 2. Thêm w-max min-w-full để ép thanh cuộn ngang (ngoài) xuất hiện khi có nhiều cột */}
          <div className="flex gap-6 h-full p-4 items-start w-max min-w-full">
            <Droppable droppableId="board" type="COLUMN" direction="horizontal">
              {(provided) => (
                <div
                  className="flex gap-6 h-full items-start"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {groups.map((group, index) => (
                    <KanbanGroup
                      key={group.id}
                      column={group}
                      index={index}
                      projectId={projectId}
                      search={search}
                      filters={filters}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <button
              onClick={() => createGroup("New Group")}
              className="w-[300px] shrink-0 py-3 bg-[#F1F2F4]/50 hover:bg-[#F1F2F4] text-gray-600 rounded-xl flex items-center justify-center transition-colors focus:outline-none"
            >
              <span className="flex items-center gap-2 font-medium text-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Column
              </span>
            </button>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
