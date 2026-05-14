"use client";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  CornerDownLeft,
  ChevronDown,
  Copy,
  Trash2,
} from "lucide-react";
import { useTaskSubtask } from "@/hooks/use-task-subtask";
import { mock } from "node:test";
import IconLoader from "../IconLoader";
import { TaskBase } from "@/types";
import { redirect, useParams, useRouter } from "next/navigation";
import { useUpdateTask } from "@/services/task.service";
import { useProjectStore } from "@/store/project.store";

export default function TaskSubtasks({ canManage }: { canManage: boolean }) {
  const {
    subtasks,
    isAdding,
    setIsAdding,
    mode,
    setMode,
    inputValue,
    setInputValue,
    matchedTasks,
    isSearching,
    handleAddSubtask,
    handleAddExistingSubtask,
    isPendingAddExistingSubtask,
    activeStatus,
    setActiveStatus,
    groupTaskData,
    isGroupTasksPending,
    handleGroupTaskChange,
    isPendingUpdateTaskGroupTask,
    assigneeData,
    isAssigneesPending,
    isPendingCreatingTask,
    handleRemoveSubtask,
    isUpdatingTask,
  } = useTaskSubtask();

  const router = useRouter();

  const { projectId, taskId } = useParams();

  const activeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeRef.current &&
        !activeRef.current.contains(event.target as Node)
      ) {
        setActiveStatus("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section id="section-subtasks" className="scroll-mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-1">
          Subtasks
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-slate-500 hover:text-slate-800"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Khu vực Nhập liệu / Tìm kiếm */}
      {isAdding && canManage && (
        <div className="relative">
          {mode === "create" ? (
            // ================= MODE 1: CREATE SUBTASK =================
            <div className="space-y-2">
              <div className="flex items-center p-1 border border-slate-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white transition-all">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      handleAddSubtask(
                        `NEW-${Date.now().toString().slice(-4)}`,
                        inputValue,
                      );
                    }
                  }}
                  placeholder="What needs to be done?"
                  className="flex-1 py-1.5 px-3 text-sm focus:outline-none bg-transparent"
                />

                {/* Nút giả lập chọn loại hình Task bên phải */}

                {!isPendingCreatingTask ? (
                  <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                    <CornerDownLeft size={14} />
                  </button>
                ) : (
                  <IconLoader size={24} />
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    setMode("search");
                    setInputValue("");
                  }}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  <Search size={14} />
                  Choose existing
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // ================= MODE 2: SEARCH EXISTING =================
            <div className="relative">
              <div className="flex items-center p-1 border border-blue-500 ring-1 ring-blue-500 rounded-md bg-white">
                <button
                  onClick={() => setMode("create")}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                >
                  <ArrowLeft size={16} />
                </button>
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search existing tasks..."
                  className="flex-1 py-1.5 px-2 text-sm focus:outline-none bg-transparent"
                />
                <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                  <CornerDownLeft size={14} />
                </button>
              </div>

              {/* Dropdown Gợi ý */}
              {inputValue && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 overflow-hidden">
                  {matchedTasks.length > 0 ? (
                    <div className="py-2">
                      <div className="px-3 pb-1 text-xs font-bold text-slate-500">
                        Matching work items
                      </div>
                      {matchedTasks.map((task: any) => (
                        <div
                          key={task.id}
                          onClick={() => handleAddExistingSubtask(task.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                        >
                          <Copy size={14} className="text-blue-500" />
                          <span className="text-slate-500">{task.task_id}</span>
                          <span className="text-slate-900">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      No matching task items found.
                    </div>
                  )}

                  {/* Nút tạo mới từ text search */}
                  <div
                    onClick={() =>
                      handleAddSubtask(
                        `NEW-${Date.now().toString().slice(-4)}`,
                        inputValue,
                      )
                    }
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <Plus size={16} />
                    Create a work item for "{inputValue}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {subtasks.length > 0 && (
        <div className="border border-gray-200 mb-3 mt-3">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-gray-200 text-slate-500 border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold w-1/2">Task</th>
                <th className="p-3 font-semibold w-1/2 whitespace-nowrap">
                  Assignee
                </th>
                <th className="p-3 font-semibold whitespace-nowrap w-[200px]">
                  Status
                </th>
                <th className="p-3 font-semibold whitespace-nowrap w-12 text-center"></th>
              </tr>
            </thead>

            <tbody className="divide-x divide-y divide-gray-200 border-b border-gray-200">
              {subtasks.map((task: TaskBase, index: number) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="p-3 w-1/2 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <Copy size={14} className="text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-slate-500 whitespace-nowrap">
                        {task.task_id}
                      </span>
                      <a
                        className="text-slate-900 truncate max-w-[200px] hover:text-blue-500 hover:underline lg:max-w-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/project/${projectId}/${task.id}`);
                        }}
                      >
                        {task.title}
                      </a>
                    </div>
                  </td>

                  {/* Cột Assignee: Co lại vừa vặn nội dung */}
                  <td className="p-3 w-1/2 whitespace-nowrap border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      {assigneeData && assigneeData.length > 0 ? (
                        (() => {
                          const user = assigneeData.find(
                            (a: any) => a?.id === task.assignee_id,
                          );

                          return (
                            <>
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                {user?.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  // Lấy chữ cái đầu của tên, nếu không có hiện "?"
                                  user?.name?.charAt(0).toUpperCase() || "?"
                                )}
                              </div>
                              <span className="text-slate-600 text-sm font-medium">
                                {user?.username || "Unassigned"}
                              </span>
                            </>
                          );
                        })()
                      ) : (
                        <div className="flex items-center gap-2 animate-pulse">
                          {/* Vòng tròn đại diện cho Avatar */}
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0" />

                          {/* Thanh ngang đại diện cho Tên người dùng */}
                          <div className="h-3 w-16 bg-slate-200 rounded" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Cột Status: Co lại vừa vặn nội dung */}
                  <td className="p-3 w-[200px] cursor-pointer whitespace-nowrap">
                    <div className="relative w-full">
                      <span
                        onClick={() => setActiveStatus(task.id)}
                        className="px-2.5 py-1 text-xs font-semibold border border-gray-200 rounded-md bg-white text-slate-600 flex items-center gap-1.5 shadow-sm"
                      >
                        {groupTaskData.find(
                          (groupTask: any) =>
                            groupTask.id === task.group_task_id,
                        )?.title || "No group task"}
                      </span>
                      {activeStatus === task.id && canManage && (
                        <div
                          ref={activeRef}
                          className="absolute z-20 top-full left-1/2 transform -translate-x-1/2  mt-1 w-max bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        >
                          {isGroupTasksPending ? (
                            <div className="px-3 py-2 flex w-20 flex justify-center items-center text-sm text-slate-500">
                              <IconLoader size={20} />
                            </div>
                          ) : (
                            <>
                              {groupTaskData.length > 0 ? (
                                groupTaskData.map((status: any) => (
                                  <div
                                    key={status.id}
                                    className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer "
                                    onClick={() =>
                                      handleGroupTaskChange(task.id, status.id)
                                    }
                                  >
                                    {status.title}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-sm text-slate-400 italic">
                                  Group task empty
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 w-12 text-center align-middle">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn không cho row chuyển hướng trang
                        handleRemoveSubtask(task.id);
                      }}
                      disabled={isUpdatingTask || !canManage}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Remove subtask"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
