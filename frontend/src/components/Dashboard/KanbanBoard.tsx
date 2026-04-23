"use client";

import { useEffect } from "react";
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

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen w-full">
        <div className="flex gap-6 h-full p-4">
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
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <button
            onClick={() => createGroup("New Group")}
            className="size-15 shrink-0 py-3 bg-[#F1F2F4]/50 hover:bg-[#F1F2F4] text-gray-600 rounded-xl flex items-center justify-center transition-colors focus:outline-none"
            title="Add column"
          >
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
          </button>
        </div>
      </div>
    </DragDropContext>
  );
}
