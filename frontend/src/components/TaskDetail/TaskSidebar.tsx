import { useTaskStore } from "@/store/task.store";
import { Label, Task, User } from "@/types";
import {
  Link2,
  Clock,
  FileText,
  Tag,
  Layers,
  Flag,
  Check,
  Search,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns"; // Bạn nên cài date-fns để format ngày tháng
import { useGetUserById } from "@/services/user.service";
import { useRef, useState } from "react";
import { useGetProjectMembers } from "@/services/project.service";
import { useProjectStore } from "@/store/project.store";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useGetGroupTaskByProjectId,
  useGetTasks,
  useUpdateTask,
} from "@/services/task.service";
import IconLoader from "../IconLoader";
import { useCreateLabel, useGetLabels } from "@/services/label.service";
import Image from "next/image";
import { ROLE } from "@/enums";

export default function TaskSidebar() {
  const startDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const inputDateRef = useRef<HTMLInputElement>(null);
  const currentProject = useProjectStore((s: any) => s.currentProject);
  const currentTask: Task | null = useTaskStore((s: any) => s.currentTask);
  const {
    data: assignee,
    isPending: pendingAssignee,
  }: { data: User; isPending: boolean } = useGetUserById(
    currentTask?.assignee_id || "",
  );

  const { data: projectMemberData, isPending: pendingGetProjectMembers } =
    useGetProjectMembers(currentProject?.id);

  const { updateTask, isPending: pendingUpdateTask } = useUpdateTask();

  const { data: projectLabels } = useGetLabels(currentProject?.id || "");
  const { mutate: createLabel, isPending: pendingCreateLabel } = useCreateLabel(
    currentProject?.id || "",
  );
  const { data: projectTasks, isPending: pendingProjectTasks } = useGetTasks(
    currentProject?.id,
  );

  const { data: groupTasksData, isPending: pendingGroupTasks } =
    useGetGroupTaskByProjectId(currentProject?.id || "");

  const { data: createdUser, isPending: pendingCreatedUser } = useGetUserById(
    currentTask?.created_by || "",
  );

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingUser, setPendingUser] = useState("");

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");

  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const currentUserRole = useProjectStore((s) => s.currentUserRole);

  const canManage =
    currentUserRole === ROLE.LEADER || currentUserRole === ROLE.MODERATOR;

  const selectedLabelIds =
    currentTask?.labels.map((label: any) => label.id) || [];

  const selectedParentIds = currentTask?.parent_id || null;

  const debounceSearchQuery = useDebounce(searchQuery, 300);
  const debounceLabelQuery = useDebounce(labelSearch, 300);
  const debounceParentQuery = useDebounce(parentSearch, 300);
  const debounceGroupQuery = useDebounce(groupSearch, 300);

  const filteredMembers =
    projectMemberData?.filter((user) =>
      user?.full_name
        ?.toLowerCase()
        .includes(debounceSearchQuery.toLowerCase()),
    ) || [];

  const filteredLabels: Label[] =
    projectLabels?.filter((l) =>
      l.name.toLowerCase().includes(debounceLabelQuery.toLowerCase()),
    ) || [];

  const filteredParents: Task[] =
    (projectTasks as Task[])?.filter((task: Task) => {
      if (task.id === currentTask?.id) return false;

      const query = debounceParentQuery.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(query);
      const matchId = task.id?.toLowerCase().includes(query);

      return matchTitle || matchId;
    }) || [];

  const filteredGroupTasks =
    groupTasksData?.filter((group: any) =>
      group?.title?.toLowerCase().includes(debounceGroupQuery.toLowerCase()),
    ) || [];

  const handleSelectParent = (parentId: string | null) => {
    if (
      pendingUpdateTask ||
      !currentTask ||
      parentId === currentTask.parent_id
    ) {
      setIsParentModalOpen(false);
      return;
    }

    updateTask(
      {
        projectId: currentProject.id,
        taskId: currentTask.id,
        payload: { parent_id: parentId },
      },
      {
        onSuccess: () => {
          setIsParentModalOpen(false);
          setParentSearch("");
        },
      },
    );
  };
  const isExactMatch = projectLabels?.some(
    (l) => l.name.toLowerCase() === labelSearch.trim().toLowerCase(),
  );

  const handleSelectAssignee = (userId: string | null) => {
    if (
      pendingUser !== "" ||
      userId === currentTask?.assignee_id ||
      !currentTask
    ) {
      setIsAssigneeModalOpen(false);
      return;
    }
    updateTask({
      projectId: currentProject.id,
      taskId: currentTask.id || "",
      payload: {
        assignee_id: userId,
      },
    });
    setSearchQuery("");
  };

  const handleToggleLabel = (labelId: string) => {
    if (pendingUpdateTask || !currentTask) return; // Chặn click liên tục

    let newLabelIds;
    if (selectedLabelIds.includes(labelId)) {
      newLabelIds = selectedLabelIds.filter((id: string) => id !== labelId);
    } else {
      newLabelIds = [...selectedLabelIds, labelId];
    }

    // Cập nhật lại task (Giả định payload backend nhận mảng label_ids)
    updateTask({
      projectId: currentProject.id,
      taskId: currentTask.id,
      payload: { label_ids: newLabelIds },
    });
  };

  const handleCreateAndAddLabel = () => {
    if (!labelSearch.trim() || pendingCreateLabel || !currentTask) return;

    const randomColors = [
      "#ef4444",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
    ];
    const randomColor =
      randomColors[Math.floor(Math.random() * randomColors.length)];

    createLabel(
      {
        project_id: currentProject.id,
        name: labelSearch.trim(),
        color_code: randomColor,
      },
      {
        onSuccess: (newLabel: any) => {
          updateTask({
            projectId: currentProject.id,
            taskId: currentTask.id,
            payload: { label_ids: [...selectedLabelIds, newLabel.id] },
          });
          setLabelSearch("");
        },
      },
    );
  };

  const handleDateChange = (
    field: "start_date" | "due_date",
    newDate: string,
  ) => {
    if (!currentTask?.id || !currentProject?.id) return;

    updateTask({
      projectId: currentProject.id,
      taskId: currentTask.id,
      payload: {
        [field]: newDate ? new Date(newDate).toISOString() : null,
      },
    });
  };

  const handleClearDate = (
    e: React.MouseEvent,
    field: "start_date" | "due_date",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentTask?.id || !currentProject.id || !canManage) return;

    updateTask({
      projectId: currentProject.id,
      taskId: currentTask.id,
      payload: { [field]: null },
    });
  };

  const handleSelectGroupTask = (groupId: string | null) => {
    if (
      pendingUpdateTask ||
      !currentTask ||
      groupId === currentTask.group_task_id
    ) {
      setIsGroupModalOpen(false);
      return;
    }
    updateTask(
      {
        projectId: currentProject.id,
        taskId: currentTask.id,
        payload: { group_task_id: groupId },
      },
      {
        onSuccess: () => {
          setIsGroupModalOpen(false);
          setGroupSearch("");
        },
      },
    );
  };

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (!pendingUpdateTask && ref && ref.current && canManage) {
      try {
        ref.current.showPicker();
      } catch (error) {
        ref.current.focus();
      }
    }
  };

  if (!currentTask) {
    return <div className="p-4 text-slate-500 italic">No task selected</div>;
  }

  return (
    <div className="space-y-8">
      {/* Details Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Details
        </h3>
        <div className="grid grid-cols-[100px_1fr] gap-y-4 text-sm">
          {/* Assignee */}
          <div className="text-slate-500 flex items-center">Assignee</div>
          {/* WRAPPER MODAL */}
          <div className="relative">
            {/* Trigger Button */}
            <div
              onClick={() => setIsAssigneeModalOpen(!isAssigneeModalOpen)}
              className={`${!canManage ? "cursor-not-allowed" : "hover:bg-slate-100 cursor-pointer"} flex items-center justify-between gap-2 font-medium  p-1.5 -ml-1.5 rounded-md  transition-colors w-fit pr-3`}
            >
              <div className="flex items-center gap-2">
                {currentTask.assignee_id ? (
                  <>
                    {pendingAssignee ? (
                      <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </div>
                    ) : assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] relative overflow-hidden">
                          {assignee.avatarUrl ? (
                            <Image
                              src={assignee.avatarUrl}
                              alt={assignee.fullName || "Avatar"}
                              fill
                              className="object-cover" // Giúp ảnh không bị méo, tự cắt trung tâm
                            />
                          ) : (
                            assignee?.fullName?.slice(-2).toUpperCase()
                          )}
                        </div>
                        <span className="text-slate-900">
                          {assignee.fullName}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Unassigned
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>
              {pendingUpdateTask && <IconLoader size={20} />}

              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* OVERLAY bắt click outside */}
            {isAssigneeModalOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAssigneeModalOpen(false)}
              />
            )}

            {/* DROPDOWN MODAL */}
            {isAssigneeModalOpen && canManage && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all relative z-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto p-1 relative z-10 bg-white">
                  <div
                    onClick={() => handleSelectAssignee(null)}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center"></div>
                    <span className="italic">Unassigned</span>
                  </div>

                  {filteredMembers && filteredMembers.length > 0 ? (
                    filteredMembers.map((user) => (
                      <div
                        key={user.user_id}
                        onClick={() =>
                          handleSelectAssignee(user?.user_id || "")
                        }
                        className="flex items-center justify-between px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] relative overflow-hidden">
                            {user.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt={user.full_name || "Avatar"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              user?.full_name?.slice(-2).toUpperCase()
                            )}
                          </div>
                          <span>{user.full_name}</span>
                        </div>
                        {currentTask.assignee_id === user.user_id && (
                          <Check size={14} className="text-blue-500" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      No users found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="text-slate-500 flex items-center">Labels</div>
          <div className="relative w-full">
            {/* KHU VỰC CLICK ĐỂ MỞ MODAL (Thay thế cho nút +) */}
            <div
              onClick={() => setIsLabelModalOpen(!isLabelModalOpen)}
              className={`flex w-full flex-wrap gap-2 items-center p-1.5 -ml-1.5 rounded-md transition-colors min-h-[32px] ${
                canManage
                  ? "cursor-pointer hover:bg-slate-100"
                  : "cursor-default"
              }`}
              title="Click to edit labels"
            >
              {currentTask.labels && currentTask.labels.length > 0 ? (
                currentTask.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2.5 py-0.5 border rounded text-xs font-semibold"
                    style={{
                      borderColor: label.color_code,
                    }}
                  >
                    {label.name.toUpperCase()}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic text-sm">No labels</span>
              )}
            </div>

            {/* OVERLAY bắt click outside */}
            {isLabelModalOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLabelModalOpen(false)}
              />
            )}

            {/* DROPDOWN MODAL */}
            {isLabelModalOpen && canManage && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                {/* Khung tìm kiếm */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                    />
                    <input
                      type="text"
                      placeholder="Search or create..."
                      value={labelSearch}
                      onChange={(e) => setLabelSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Danh sách Label */}
                <div className="max-h-48 overflow-y-auto p-1 text-sm text-slate-700">
                  {filteredLabels.length > 0
                    ? filteredLabels.map((label) => {
                        const isSelected = selectedLabelIds.includes(label.id);
                        return (
                          <div
                            key={label.id}
                            onClick={() => handleToggleLabel(label.id)}
                            className={`flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 rounded cursor-pointer transition-colors group`}
                          >
                            <div
                              className="flex border items-center gap-2 px-1 rounded"
                              style={{ borderColor: label.color_code }}
                            >
                              <span className="font-medium text-slate-600 group-hover:text-slate-900">
                                {label.name}
                              </span>
                            </div>

                            {isSelected && (
                              <Check size={14} className="text-blue-500" />
                            )}
                          </div>
                        );
                      })
                    : !labelSearch && (
                        <div className="px-3 py-4 text-center text-xs text-slate-400">
                          No labels found
                        </div>
                      )}

                  {labelSearch.trim() !== "" && !isExactMatch && (
                    <div
                      onClick={handleCreateAndAddLabel}
                      className="flex items-center gap-2 px-2.5 py-2 mt-1 hover:bg-blue-50 rounded cursor-pointer transition-colors text-blue-600 border-t border-slate-100"
                    >
                      {pendingCreateLabel ? (
                        <IconLoader size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                      <span className="font-medium truncate">
                        Create "{labelSearch.trim()}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Parent Task */}
          <div className="text-slate-500 flex items-center">Parent</div>
          <div className="relative w-full">
            <div
              onClick={() => setIsParentModalOpen(!isParentModalOpen)}
              className={`flex w-full flex-wrap gap-2 items-center p-1.5 -ml-1.5 rounded-md transition-colors min-h-[32px] ${
                canManage
                  ? "cursor-pointer hover:bg-slate-100"
                  : "cursor-default"
              }`}
              title="Click to change parent task"
            >
              {currentTask.parent ? (
                <div className="flex items-center gap-1.5 font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                  <Link2 size={14} className="shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {currentTask.parent.title}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic text-sm">No parent</span>
              )}
            </div>

            {isParentModalOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsParentModalOpen(false)}
              />
            )}

            {isParentModalOpen && canManage && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                {/* Khung tìm kiếm */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                    />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Danh sách Task */}
                <div className="max-h-56 overflow-y-auto p-1 text-sm text-slate-700 relative">
                  {/* Loading overlay khi đang update */}
                  {pendingUpdateTask && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex justify-center pt-4">
                      <IconLoader size={20} />
                    </div>
                  )}

                  {/* Nút Remove Parent (Chỉ hiện khi đang có parent và không gõ text search) */}
                  {currentTask.parent_id && !parentSearch && (
                    <div
                      onClick={() => handleSelectParent(null)}
                      className="flex items-center gap-2 px-2.5 py-2 mb-1 hover:bg-red-50 rounded cursor-pointer transition-colors text-red-500"
                    >
                      <span className="font-medium">No parent</span>
                    </div>
                  )}

                  {filteredParents.length > 0 ? (
                    filteredParents.map((task) => {
                      const isSelected = currentTask.parent_id === task.id;
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleSelectParent(task.id)}
                          className={`flex items-start gap-2 justify-between px-2.5 py-2 hover:bg-slate-50 rounded cursor-pointer transition-colors group`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Link2
                              size={14}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="font-medium text-slate-600 group-hover:text-blue-600 truncate">
                              {task.title}
                            </span>
                          </div>

                          {isSelected && (
                            <Check
                              size={14}
                              className="text-blue-500 shrink-0"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-6 text-center flex flex-col items-center gap-2 text-slate-400">
                      <p className="text-xs">No tasks found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="text-slate-500 flex items-center">Start date</div>
          <div className="relative flex items-center group">
            <input
              type="date"
              ref={startDateRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 opacity-0 pointer-events-none"
              value={
                currentTask.start_date
                  ? format(new Date(currentTask.start_date), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) => handleDateChange("start_date", e.target.value)} // Truyền field start_date
              disabled={pendingUpdateTask}
            />

            {currentTask.start_date ? (
              <div className="flex items-center gap-1">
                <div
                  onClick={() => openDatePicker(startDateRef)}
                  className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded w-fit text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                    pendingUpdateTask ? "opacity-50 pointer-events-none" : ""
                  } `}
                >
                  <Clock size={14} />
                  {format(new Date(currentTask.start_date), "MMM dd, yyyy")}
                </div>

                <button
                  onClick={(e) => handleClearDate(e, "start_date")} // Truyền field
                  disabled={pendingUpdateTask || !canManage}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity disabled:opacity-0"
                  title="Remove start date"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => openDatePicker(startDateRef)} // Truyền ref
                className={`text-slate-400 italic cursor-pointer hover:text-slate-600 transition-colors ${
                  pendingUpdateTask ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                No start date
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="text-slate-500 flex items-center">Due date</div>
          <div className="relative flex items-center group">
            <input
              type="date"
              ref={dueDateRef} // Sử dụng dueDateRef
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 opacity-0 pointer-events-none"
              value={
                currentTask.due_date
                  ? format(new Date(currentTask.due_date), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) => handleDateChange("due_date", e.target.value)} // Truyền field due_date
              disabled={pendingUpdateTask}
            />

            {currentTask.due_date ? (
              <div className="flex items-center gap-1">
                <div
                  onClick={() => openDatePicker(dueDateRef)} // Truyền ref
                  className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded w-fit text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                    pendingUpdateTask ? "opacity-50 pointer-events-none" : ""
                  } ${
                    new Date(currentTask.due_date) < new Date()
                      ? "text-red-600 bg-red-50"
                      : "text-slate-700 bg-slate-100"
                  }`}
                >
                  <Clock size={14} />
                  {format(new Date(currentTask.due_date), "MMM dd, yyyy")}
                  {new Date(currentTask.due_date) < new Date() && " (Overdue)"}
                </div>

                <button
                  onClick={(e) => handleClearDate(e, "due_date")} // Truyền field
                  disabled={pendingUpdateTask || !canManage}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity disabled:opacity-0"
                  title="Remove due date"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => openDatePicker(dueDateRef)} // Truyền ref
                className={`text-slate-400 italic cursor-pointer hover:text-slate-600 transition-colors ${
                  pendingUpdateTask ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                No due date
              </div>
            )}
          </div>

          {/* Group Task / Team */}
          <div className="text-slate-500 flex items-center">Group</div>
          <div className="relative">
            <div
              onClick={() => setIsGroupModalOpen(!isGroupModalOpen)}
              className={`flex items-center justify-between gap-2 font-medium p-1.5 -ml-1.5 rounded-md transition-colors w-fit pr-3 ${
                canManage
                  ? "cursor-pointer hover:bg-slate-100"
                  : "cursor-default"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-400" />
                {currentTask.groupTask?.title ? (
                  <span className="text-slate-900">
                    {currentTask.groupTask.title}
                  </span>
                ) : (
                  <span className="text-slate-400 italic font-normal">
                    General (No Group)
                  </span>
                )}
              </div>
              {pendingUpdateTask && <IconLoader size={20} />}
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* OVERLAY bắt click outside */}
            {isGroupModalOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsGroupModalOpen(false)}
              />
            )}

            {/* DROPDOWN MODAL */}
            {isGroupModalOpen && canManage && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                    />
                    <input
                      type="text"
                      placeholder="Search groups..."
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all relative z-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto p-1 relative z-10 bg-white">
                  {/* Default Option (Unassigned / General) */}
                  <div
                    onClick={() => handleSelectGroupTask(null)}
                    className="flex items-center justify-between px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers size={14} className="text-slate-400" />
                      <span className="italic">General (No Group)</span>
                    </div>
                    {!currentTask.group_task_id && (
                      <Check size={14} className="text-blue-500" />
                    )}
                  </div>

                  {filteredGroupTasks && filteredGroupTasks.length > 0 ? (
                    filteredGroupTasks.map((group: any) => (
                      <div
                        key={group.id}
                        onClick={() => handleSelectGroupTask(group.id)}
                        className="flex items-center justify-between px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Layers
                            size={14}
                            className="text-blue-500 shrink-0"
                          />
                          <span className="truncate">{group.title}</span>
                        </div>
                        {currentTask.group_task_id === group.id && (
                          <Check size={14} className="text-blue-500 shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      No groups found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div className="text-slate-500 flex items-center">Reporter</div>
          <div className="flex items-center gap-2 font-medium">
            {pendingCreatedUser ? (
              <>
                <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse"></div>
                <div className="h-4 w-24 rounded bg-slate-200 animate-pulse"></div>
              </>
            ) : (
              <>
                <div className="flex relative overflow-hidden h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                  <Image
                    fill
                    src={createdUser?.avatarUrl}
                    alt={createdUser?.fullName}
                  />
                </div>
                <span className="text-slate-900">{createdUser?.fullName}</span>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
