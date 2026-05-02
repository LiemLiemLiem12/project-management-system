"use client";
import { useState, useEffect } from "react";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { useTaskStore } from "@/store/task.store";
import { Checklist } from "@/types";
import {
  useCreateChecklist,
  useUpdateChecklist,
  useDeleteChecklist,
} from "@/services/checklist.service";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export default function TaskChecklist({ canManage }: { canManage: boolean }) {
  const currentTask = useTaskStore((s: any) => s.currentTask);
  const items: Checklist[] = currentTask?.checklists || [];

  const [orderedItems, setOrderedItems] = useState<Checklist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [isMounted, setIsMounted] = useState(false);

  const taskId = currentTask?.id;

  const { mutate: createChecklist, isPending: isCreating } =
    useCreateChecklist(taskId);
  const { mutate: updateChecklist, isPending: isUpdating } =
    useUpdateChecklist(taskId);
  const { mutate: deleteChecklist, isPending: isDeleting } =
    useDeleteChecklist(taskId);

  // BIẾN TỔNG HỢP: Kiểm tra xem có đang gọi API nào không
  const isLoading = isCreating || isUpdating || isDeleting;

  // Đồng bộ data từ store vào local state (sắp xếp theo position nếu có)
  useEffect(() => {
    setIsMounted(true);
    if (items) {
      const sortedItems = [...items].sort(
        (a, b) => (a.position || 0) - (b.position || 0),
      );
      setOrderedItems(sortedItems);
    }
  }, [items]);

  const completedCount = orderedItems
    ? orderedItems.filter((i: Checklist) => i.is_completed).length
    : 0;
  const progress =
    orderedItems?.length === 0
      ? 0
      : (completedCount / orderedItems?.length) * 100;

  const toggleItem = (id: string, currentStatus: boolean) => {
    updateChecklist({
      checklistId: id,
      payload: { is_completed: !currentStatus },
    });
  };

  const deleteItem = (id: string) => {
    deleteChecklist(id);
  };

  const handleDeleteList = () => {
    if (confirm("Are you sure you want to delete the entire checklist?")) {
      orderedItems.forEach((item) => deleteChecklist(item.id));
    }
  };

  const handleAddItem = () => {
    if (!inputValue.trim() || isLoading) return;

    createChecklist(
      {
        title: inputValue.trim(),
      },
      {
        onSuccess: () => {
          setInputValue("");
          setIsAdding(false);
        },
      },
    );
  };

  // 2. Hàm xử lý logic khi thả chuột
  const onDragEnd = (result: DropResult) => {
    if (isLoading) return;

    const { source, destination } = result;

    if (!destination || source.index === destination.index) return;

    const newItems = Array.from(orderedItems);
    const [movedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, movedItem);

    setOrderedItems(newItems);

    const minIndex = Math.min(source.index, destination.index);
    const maxIndex = Math.max(source.index, destination.index);

    for (let i = minIndex; i <= maxIndex; i++) {
      updateChecklist({
        checklistId: newItems[i].id,
        payload: { position: i },
      });
    }
  };

  if (!isMounted || !currentTask) return null;

  return (
    <section id="section-checklist" className="scroll-mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Checklist</h2>
          {orderedItems?.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 rounded-full text-slate-600">
              {completedCount}/{orderedItems?.length}
            </span>
          )}
        </div>
        {orderedItems?.length > 0 && (
          <button
            onClick={handleDeleteList}
            disabled={isLoading}
            className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            Delete list
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {orderedItems.length > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Items List với Drag Drop Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`checklist-${taskId}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              // LÀM MỜ UI VÀ CHẶN CLICK KHI ĐANG LOADING
              className={`space-y-1 transition-opacity duration-200 ${
                isLoading ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {orderedItems.map((item: Checklist, index: number) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                  isDragDisabled={isLoading} // CHẶN KÉO THẢ TẠI ĐÂY
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group flex items-center justify-between p-2 -mx-2 rounded-lg transition-colors ${
                        snapshot.isDragging
                          ? "bg-blue-50 shadow-md border border-blue-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        {/* Drag Handle - Nút cầm để kéo */}
                        <div
                          {...provided.dragHandleProps}
                          className={`mt-1 focus:outline-none ${
                            isLoading
                              ? "text-slate-200 cursor-not-allowed"
                              : "text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
                          }`}
                        >
                          <GripVertical size={16} />
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={item.is_completed}
                            onChange={() =>
                              toggleItem(item.id, item.is_completed)
                            }
                            disabled={isLoading}
                            className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer transition-colors disabled:opacity-50"
                          />
                          <span
                            className={`text-sm transition-all ${
                              item.is_completed
                                ? "line-through text-slate-400"
                                : "text-slate-700"
                            }`}
                          >
                            {item.title}
                          </span>
                        </label>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteItem(item.id)}
                        disabled={isLoading}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-0"
                        title="Delete item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add New Item Form */}
      <div className="mt-3">
        {isAdding && canManage ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") setIsAdding(false);
              }}
              disabled={isLoading}
              className="py-2 px-4 w-full border border-blue-500 outline-none rounded-md bg-white text-sm shadow-sm disabled:opacity-50 disabled:bg-slate-50"
              placeholder="What needs to be done?"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={isLoading}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Wait..." : "Add"}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
                className="px-3 py-1.5 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
            className={`flex items-center gap-1.5 text-sm font-medium ${
              canManage
                ? "text-blue-600 hover:text-blue-700"
                : "text-gray-500 cursor-not-allowed"
            } transition-colors py-1 disabled:opacity-50`}
          >
            <Plus size={16} />
            Add an item
          </button>
        )}
      </div>
    </section>
  );
}
