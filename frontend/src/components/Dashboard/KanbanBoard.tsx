"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import KanbanGroup from "./KanbanGroup";

const INITIAL_DATA = [
  {
    id: "col-1",
    title: "Backlog",
    tasks: Array.from({ length: 6 }).map((_, i) => ({
      id: `T-0${i + 1}`,
      title: "Design new landing page",
      labels: ["Label", "Label"],
      date: "Feb 07",
      avatar: "https://i.pravatar.cc/150?img=47",
    })),
  },
  {
    id: "col-2",
    title: "In Progress",
    tasks: Array.from({ length: 2 }).map((_, i) => ({
      id: `T-1${i + 1}`,
      title: "Design new landing page",
      labels: ["Label", "Label"],
      date: "Feb 07",
      avatar: "https://i.pravatar.cc/150?img=47",
    })),
  },
  {
    id: "col-3",
    title: "Review",
    tasks: Array.from({ length: 4 }).map((_, i) => ({
      id: `T-2${i + 1}`,
      title: "Design new landing page",
      labels: ["Label", "Label"],
      date: "Feb 07",
      avatar: "https://i.pravatar.cc/150?img=47",
    })),
  },
];

export default function KanbanBoard() {
  const [data, setData] = useState(INITIAL_DATA);
  const [isMounted, setIsMounted] = useState(false);

  // Fix lỗi Hydration của Next.js khi dùng DnD
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    // Nếu thả ra ngoài vùng cho phép hoặc thả lại vị trí cũ
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "COLUMN") {
      const newData = [...data];
      const [removeColumn] = newData.splice(source.index, 1);
      newData.splice(destination.index, 0, removeColumn);
      setData(newData);
    }

    if (type === "TASK") {
      const newData = [...data];
      const sourceColIndex = newData.findIndex(
        (col) => col.id === source.droppableId,
      );
      const destColIndex = newData.findIndex(
        (col) => col.id === destination.droppableId,
      );

      const sourceCol = newData[sourceColIndex];
      const destCol = newData[destColIndex];

      const sourceTasks = [...sourceCol.tasks];
      const destTasks =
        source.droppableId === destination.droppableId
          ? sourceTasks
          : [...destCol.tasks];

      // Cắt task khỏi cột nguồn và chèn vào cột đích
      const [removedTask] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removedTask);

      newData[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
      if (source.droppableId !== destination.droppableId) {
        newData[destColIndex] = { ...destCol, tasks: destTasks };
      }

      // Cập nhật lại state
      setData(newData);
    }
  };

  if (!isMounted) return null; // Hoặc trả về giao diện skeleton loading

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen w-full">
        <div className="flex gap-6 h-full ">
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided: any) => (
              <div
                className="flex gap-6 h-full items-start"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {data.map((column, index) => (
                  <KanbanGroup key={column.id} column={column} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <button
            onClick={() => {
              setData((prev) => [
                ...prev,
                {
                  id: Math.random().toString(),
                  title: "Review",
                  tasks: [],
                },
              ]);
            }}
            className="size-15 shrink-0 py-3 bg-[#F1F2F4]/50 hover:bg-[#F1F2F4]  text-gray-600 rounded-xl flex items-center justify-center font-semibold transition-colors focus:outline-none"
          >
            <svg
              className="w-5 h-5 mr-1"
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
