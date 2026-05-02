"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import KanbanItem from "./KanbanItem";
import { useState, useRef, useEffect } from "react";
import { GroupTask } from "@/API/task.api";
import {
  useCreateTask,
  useRenameGroup,
  useDeleteGroupWithFallback,
} from "@/services/task.service";
import { useProjectStore } from "@/store/project.store";
import { useTaskStore } from "@/store/task.store";
import {
  CalendarIcon,
  UserCircleIcon,
  CornerDownLeftIcon,
  XIcon,
  CheckIcon,
  MoreVertical,
  Trash2,
  Edit2,
  AlertTriangle,
  PlayCircleIcon,
} from "lucide-react";

import { FilterState } from "@/components/Kanban/FilterButton";

interface KanbanGroupProps {
  column: GroupTask;
  index: number;
  projectId: string;
  search?: string;
  filters?: FilterState;
}

const KanbanGroup = ({
  column,
  index,
  projectId,
  search = "",
  filters = { parent: [], assignee: [] },
}: KanbanGroupProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fallbackGroupId, setFallbackGroupId] = useState("");

  const startDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);

  const currentUserRole = useProjectStore((s) => s.currentUserRole);
  const members = useProjectStore((s) => s.members);
  const allGroups = useTaskStore((s) => s.groups);

  const { mutate: createTask, isPending: isCreatingTask } =
    useCreateTask(projectId);
  const { mutate: renameGroup, isPending: isRenaming } =
    useRenameGroup(projectId);
  const { mutate: deleteGroup, isPending: isDeleting } =
    useDeleteGroupWithFallback(projectId);

  const canManage =
    currentUserRole === "Leader" || currentUserRole === "Moderator";
  const isLastColumn = allGroups.length <= 1;
  const availableGroups = allGroups.filter((g) => g.id !== column.id);
  const selectedMemberInfo = members?.find(
    (m: any) => m.user_id === selectedMember,
  );
  const filteredMembers = members.filter((m) => {
    const name = (m as any).full_name || m.user_id;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ========================================================
  // 🚀 LÕI LỌC DỮ LIỆU TASK (Fix lỗi chữ 'a')
  // ========================================================
  const filteredTasks = column.tasks.filter((t: any) => {
    const safeSearch = (search || "").trim().toLowerCase();
    const taskName = String(t.title || t.name || "").toLowerCase();
    const taskCode = String(t.taskCode || t.id || "")
      .toLowerCase()
      .replace("task-", "");

    const matchSearch =
      !safeSearch ||
      taskName.includes(safeSearch) ||
      taskCode.includes(safeSearch);

    const tAssignees = t.assigneeIds || (t.assignee_id ? [t.assignee_id] : []);
    const matchAssignee =
      !filters?.assignee ||
      filters.assignee.length === 0 ||
      (filters.assignee.includes("unassigned") && tAssignees.length === 0) ||
      tAssignees.some((id: string) => filters.assignee.includes(String(id)));

    const matchParent =
      !filters?.parent ||
      filters.parent.length === 0 ||
      filters.parent.includes(String(t.parent_id)) ||
      filters.parent.includes(String(t.parentId)) ||
      filters.parent.includes(String(t.id));

    return matchSearch && matchAssignee && matchParent;
  });

  useEffect(() => {
    if (showDeleteModal && availableGroups.length > 0 && !fallbackGroupId) {
      setFallbackGroupId(availableGroups[0].id);
    }
  }, [showDeleteModal, availableGroups, fallbackGroupId]);

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || isCreatingTask) return;
    createTask(
      {
        title: newTaskTitle,
        group_task_id: column.id,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
        assignee_id: selectedMember || undefined,
      },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          setStartDate("");
          setDueDate("");
          setSelectedMember(null);
          setSearchQuery("");
          setIsCreating(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setNewTaskTitle("");
    setStartDate("");
    setDueDate("");
    setSelectedMember(null);
    setShowMemberPopup(false);
    setSearchQuery("");
    setIsCreating(false);
  };

  const handleRenameGroup = () => {
    const trimmed = titleValue.trim();
    if (!trimmed || trimmed === column.title) {
      setIsEditingTitle(false);
      return;
    }
    renameGroup(
      { groupId: column.id, title: trimmed },
      { onSettled: () => setIsEditingTitle(false) },
    );
  };

  const handleConfirmDelete = () => {
    if (!fallbackGroupId) return;
    deleteGroup(
      { groupId: column.id, fallbackGroupId },
      { onSuccess: () => setShowDeleteModal(false) },
    );
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            // 🚀 h-full max-h-full giúp cột kéo dài chạm đáy
            className={`flex flex-col bg-[#F1F2F4] rounded-xl w-[320px] min-w-[320px] shrink-0 h-full max-h-full group/col transition-all relative ${
              snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500 z-40" : ""
            }`}
          >
            <div
              className="p-4 flex items-center justify-between shrink-0"
              {...provided.dragHandleProps}
            >
              <div className="flex items-center gap-2 flex-1 mr-2">
                {isEditingTitle ? (
                  <input
                    autoFocus
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleRenameGroup}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameGroup();
                      if (e.key === "Escape") {
                        setTitleValue(column.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    disabled={isRenaming}
                    className="bg-white border border-blue-500 rounded px-2 py-0.5 text-sm w-full outline-none disabled:opacity-50"
                  />
                ) : (
                  <>
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider truncate max-w-[180px]">
                      {column.title}
                    </h3>
                    <span className="text-gray-400 text-xs font-semibold">
                      {filteredTasks.length}
                    </span>
                    {column.isSuccess && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 uppercase tracking-wide">
                        Done
                      </span>
                    )}
                  </>
                )}
              </div>

              {canManage && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen((v) => !v);
                    }}
                    className={`p-1 rounded-md transition-all text-gray-500 ${
                      isMenuOpen
                        ? "opacity-100 bg-gray-200"
                        : "opacity-0 group-hover/col:opacity-100 hover:bg-gray-200"
                    }`}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-44 bg-white shadow-xl border border-gray-100 rounded-lg z-50 py-1 overflow-hidden">
                        <button
                          onClick={() => {
                            setIsEditingTitle(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 size={13} />
                          Rename column
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => {
                            if (isLastColumn) return;
                            setIsMenuOpen(false);
                            setShowDeleteModal(true);
                          }}
                          disabled={isLastColumn}
                          title={
                            isLastColumn
                              ? "Cannot delete the last column"
                              : undefined
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <Trash2 size={13} />
                          Remove column
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Droppable droppableId={column.id} type="TASK">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  // 🚀 overflow-y-auto đảm nhiệm cuộn dọc khi thẻ task bị nhiều quá
                  className={`flex-1 overflow-y-auto overflow-x-hidden px-3 flex flex-col gap-3 ${
                    showMemberPopup ? "pb-64" : "pb-4"
                  }`}
                >
                  {filteredTasks.map((task: any, index: number) => (
                    <KanbanItem key={task.id} task={task} index={index} />
                  ))}

                  {provided.placeholder}

                  {canManage && (
                    <>
                      {isCreating ? (
                        <div className="bg-white rounded-lg shadow-sm p-3 mb-2 mt-1 relative z-10 shrink-0">
                          <textarea
                            autoFocus
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full text-sm border-none focus:ring-0 focus:outline-none resize-none p-0 min-h-[50px] placeholder:text-gray-300 text-gray-700 bg-transparent"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleCreateTask();
                              }
                              if (e.key === "Escape") handleCancel();
                            }}
                          />

                          {/* 🚀 Cụm Tool Create Task (Ngày giờ & Assign) */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 relative">
                            <div className="flex items-center gap-2 text-gray-400">
                              {/* Start Date */}
                              <div
                                className="relative flex items-center gap-1"
                                title="Start Date"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    startDateRef.current?.showPicker()
                                  }
                                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${startDate ? "text-emerald-500" : ""}`}
                                >
                                  <PlayCircleIcon size={16} />
                                </button>
                                <input
                                  type="date"
                                  ref={startDateRef}
                                  className="absolute opacity-0 pointer-events-none w-0"
                                  onChange={(e) => setStartDate(e.target.value)}
                                />
                              </div>

                              {/* Due Date */}
                              <div
                                className="relative flex items-center gap-1"
                                title="Due Date"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    dueDateRef.current?.showPicker()
                                  }
                                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${dueDate ? "text-blue-500" : ""}`}
                                >
                                  <CalendarIcon size={16} />
                                </button>
                                <input
                                  type="date"
                                  ref={dueDateRef}
                                  className="absolute opacity-0 pointer-events-none w-0"
                                  onChange={(e) => setDueDate(e.target.value)}
                                />
                              </div>

                              {/* Assign Member (Đã được hồi sinh) */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowMemberPopup((v) => !v)}
                                  className={`p-1 rounded transition-colors flex items-center gap-1 ${
                                    selectedMember
                                      ? "text-blue-500"
                                      : showMemberPopup
                                        ? "text-blue-500 bg-blue-50"
                                        : "hover:bg-gray-100"
                                  }`}
                                >
                                  {selectedMemberInfo ? (
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                      {(
                                        (selectedMemberInfo as any).full_name ||
                                        selectedMemberInfo.user_id
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  ) : (
                                    <UserCircleIcon size={16} />
                                  )}
                                </button>

                                {showMemberPopup && (
                                  <div className="absolute bottom-full left-0 mb-2 w-52 bg-white shadow-2xl border border-gray-200 rounded-lg z-[9999] p-2">
                                    <p className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                                      Assign to member
                                    </p>

                                    <input
                                      type="text"
                                      value={searchQuery}
                                      onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                      }
                                      placeholder="Search..."
                                      className="w-full text-xs px-2 py-1.5 mb-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />

                                    <div
                                      onClick={() => {
                                        setSelectedMember(null);
                                        setShowMemberPopup(false);
                                      }}
                                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                                        —
                                      </div>
                                      <span className="text-xs text-gray-400 italic">
                                        Unassigned
                                      </span>
                                      {!selectedMember && (
                                        <CheckIcon
                                          size={12}
                                          className="ml-auto text-blue-500"
                                        />
                                      )}
                                    </div>

                                    <div className="max-h-48 overflow-y-auto">
                                      {filteredMembers.map((m) => {
                                        const displayName =
                                          (m as any).full_name || m.user_id;
                                        return (
                                          <div
                                            key={m.user_id}
                                            onClick={() => {
                                              setSelectedMember(m.user_id);
                                              setShowMemberPopup(false);
                                            }}
                                            className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-md cursor-pointer"
                                          >
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                              {displayName
                                                .charAt(0)
                                                .toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs text-gray-700 font-medium truncate">
                                                {displayName}
                                              </p>
                                              <p className="text-[10px] text-gray-400">
                                                {m.role}
                                              </p>
                                            </div>
                                            {selectedMember === m.user_id && (
                                              <CheckIcon
                                                size={12}
                                                className="text-blue-500 shrink-0"
                                              />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                              <button
                                onClick={handleCreateTask}
                                disabled={
                                  isCreatingTask || !newTaskTitle.trim()
                                }
                                className="p-1 bg-gray-100 hover:bg-blue-600 hover:text-white disabled:opacity-40 text-gray-400 rounded transition-all"
                              >
                                <CornerDownLeftIcon size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCreating(true)}
                          className="opacity-0 group-hover/col:opacity-100 shrink-0 transition-all duration-200 flex items-center gap-2 w-full py-2 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium mt-1 mb-2"
                        >
                          <span className="text-lg leading-none">+</span> Add a
                          card
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </Draggable>

      {/* Modal Xóa Cột */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[550px] p-6 text-gray-800">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle size={20} className="fill-red-600 text-white" />
              <h2 className="text-xl font-bold">
                Move work from "{column.title}" column
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Select a new home for any work in this column before deleting it.
            </p>

            {column.isSuccess && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 mb-5 text-xs text-yellow-700">
                <AlertTriangle
                  size={14}
                  className="shrink-0 mt-0.5 text-yellow-500"
                />
                <span>
                  This is the <strong>Done</strong> column. The "Done" status
                  will be transferred to the column you select below.
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">
                  This column will be deleted:
                </p>
                <div className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-700 uppercase">
                  {column.title}
                </div>
              </div>

              <div className="pt-5 text-gray-400 text-lg font-bold">→</div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">
                  Move existing tasks to:
                </p>
                {availableGroups.length > 0 ? (
                  <select
                    value={fallbackGroupId}
                    onChange={(e) => setFallbackGroupId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-medium uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {availableGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="border border-red-200 rounded px-3 py-2 bg-red-50 text-xs text-red-500">
                    No other columns available. Delete tasks first.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFallbackGroupId("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || !fallbackGroupId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete column"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KanbanGroup;
