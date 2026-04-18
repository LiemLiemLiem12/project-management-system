import { Draggable, Droppable } from "@hello-pangea/dnd";
import KanbanItem from "./KanbanItem";
import { useState, useRef } from "react";
import { GroupTask } from "@/API/task.api";
import { useCreateTask } from "@/services/task.service";
import { useProjectStore } from "@/store/project.store";
import {
  CalendarIcon,
  UserCircleIcon,
  CornerDownLeftIcon,
  XIcon,
  CheckIcon,
} from "lucide-react";

interface KanbanGroupProps {
  column: GroupTask;
  index: number;
  projectId: string;
}

const KanbanGroup = ({ column, index, projectId }: KanbanGroupProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showMemberPopup, setShowMemberPopup] = useState(false);

  // STATE MỚI: Lưu từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const currentUserRole = useProjectStore((s) => s.currentUserRole);
  const members = useProjectStore((s) => s.members);

  const canCreateTask =
    currentUserRole === "Leader" || currentUserRole === "Moderator";

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || isPending) return;

    createTask(
      {
        title: newTaskTitle,
        group_task_id: column.id,
        due_date: dueDate || undefined,
        assignee_id: selectedMember || undefined,
      },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          setDueDate("");
          setSelectedMember(null);
          setIsCreating(false);
          setSearchQuery(""); // Reset search khi tạo xong
        },
      },
    );
  };

  const handleCancel = () => {
    setNewTaskTitle("");
    setDueDate("");
    setSelectedMember(null);
    setShowMemberPopup(false);
    setIsCreating(false);
    setSearchQuery(""); // Reset search khi hủy
  };

  const selectedMemberInfo = members?.find((m) => m.user_id === selectedMember);

  // LOGIC LỌC MEMBER: Lọc theo full_name, nếu không có thì fallback sang user_id
  const filteredMembers = members.filter((m) => {
    const searchTarget = m.full_name || m.user_id;
    return searchTarget.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex flex-col bg-[#F1F2F4] rounded-xl w-[300px] shrink-0 h-full group transition-all ${
            snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500 z-40" : ""
          }`}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between"
            {...provided.dragHandleProps}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                {column.title}
              </h3>
              <span className="text-gray-400 text-xs font-semibold">
                {column.tasks.length}
              </span>
            </div>
          </div>

          {/* Droppable body */}
          <Droppable droppableId={column.id} type="TASK">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-3 flex flex-col gap-3 ${
                  showMemberPopup ? "pb-64" : "pb-4" // Nới rộng thêm một chút đề phòng popup search dài ra
                }`}
              >
                {column.tasks.map((task, index) => (
                  <KanbanItem key={task.id} task={task} index={index} />
                ))}

                {provided.placeholder}

                {/* ── Add a card ── */}
                {canCreateTask && (
                  <>
                    {isCreating ? (
                      <div className="bg-white rounded-lg shadow-sm p-3 mb-2 mt-1">
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

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 relative">
                          <div className="flex items-center gap-2 text-gray-400">
                            {/* Date picker */}
                            <div className="relative flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  dateInputRef.current?.showPicker()
                                }
                                className={`p-1 rounded hover:bg-gray-100 transition-colors ${dueDate ? "text-blue-500" : ""}`}
                              >
                                <CalendarIcon size={16} />
                              </button>
                              <input
                                type="date"
                                ref={dateInputRef}
                                className="absolute opacity-0 pointer-events-none w-0"
                                onChange={(e) => setDueDate(e.target.value)}
                              />
                              {dueDate && (
                                <span className="text-[10px] font-medium bg-blue-50 px-1.5 py-0.5 rounded text-blue-600">
                                  {dueDate}
                                </span>
                              )}
                            </div>

                            {/* Member picker */}
                            <div className="relative">
                              <button
                                onClick={() => {
                                  setShowMemberPopup((v) => !v);
                                  if (showMemberPopup) setSearchQuery(""); // Đóng popup thì xóa search
                                }}
                                className={`p-1 rounded transition-colors flex items-center gap-1 ${
                                  selectedMember
                                    ? "text-blue-500"
                                    : showMemberPopup
                                      ? "text-blue-500 bg-blue-50"
                                      : "hover:bg-gray-100"
                                }`}
                              >
                                {selectedMemberInfo ? (
                                  selectedMemberInfo.avatar_url ? (
                                    <img
                                      src={selectedMemberInfo.avatar_url}
                                      alt="avatar"
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                      {(
                                        selectedMemberInfo.full_name ||
                                        selectedMemberInfo.user_id
                                      )
                                        .slice(0, 1)
                                        .toUpperCase()}
                                    </div>
                                  )
                                ) : (
                                  <UserCircleIcon size={16} />
                                )}
                              </button>

                              {showMemberPopup && (
                                <div className="absolute top-full left-0 mt-2 w-52 bg-white shadow-xl border rounded-lg z-50 overflow-hidden flex flex-col">
                                  <div className="p-2 border-b bg-gray-50/50">
                                    <p className="text-[10px] font-bold text-gray-400 px-1 mb-1.5 uppercase">
                                      Assign to member
                                    </p>
                                    <input
                                      type="text"
                                      autoFocus
                                      placeholder="Search member..."
                                      value={searchQuery}
                                      onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                      }
                                      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-blue-400 transition-colors bg-white text-gray-700 placeholder:text-gray-400"
                                      onKeyDown={(e) => {
                                        // Ngăn chặn nút Enter/Esc kích hoạt tạo task ở ngoài
                                        e.stopPropagation();
                                        if (e.key === "Escape")
                                          setShowMemberPopup(false);
                                      }}
                                    />
                                  </div>

                                  <div className="max-h-[160px] overflow-hidden hover:overflow-y-auto overscroll-contain p-1">
                                    {/* Unassigned option (Chỉ hiện khi chưa search) */}
                                    {!searchQuery && (
                                      <div
                                        onClick={() => {
                                          setSelectedMember(null);
                                          setShowMemberPopup(false);
                                        }}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer mb-1"
                                      >
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                          —
                                        </div>
                                        <span className="text-xs text-gray-500 italic">
                                          Unassigned
                                        </span>
                                      </div>
                                    )}

                                    {/* Filtered Members */}
                                    {filteredMembers.map((m) => (
                                      <div
                                        key={m.user_id}
                                        onClick={() => {
                                          setSelectedMember(m.user_id);
                                          setShowMemberPopup(false);
                                          setSearchQuery(""); // Chọn xong thì xóa search
                                        }}
                                        className="flex items-center justify-between gap-2 p-2 hover:bg-blue-50 rounded-md cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          {m.avatar_url ? (
                                            <img
                                              src={m.avatar_url}
                                              alt="avatar"
                                              className="w-6 h-6 rounded-full object-cover shrink-0"
                                            />
                                          ) : (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                              {(m.full_name || m.user_id)
                                                .slice(0, 1)
                                                .toUpperCase()}
                                            </div>
                                          )}
                                          <div className="overflow-hidden">
                                            <p
                                              className="text-xs text-gray-700 font-medium truncate w-[100px]"
                                              title={m.full_name || m.user_id}
                                            >
                                              {m.full_name || m.user_id}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                              {m.role}
                                            </p>
                                          </div>
                                        </div>
                                        {selectedMember === m.user_id && (
                                          <CheckIcon
                                            size={12}
                                            className="text-blue-500 shrink-0"
                                          />
                                        )}
                                      </div>
                                    ))}

                                    {/* Báo lỗi nếu search không ra ai */}
                                    {filteredMembers.length === 0 && (
                                      <p className="text-[10px] text-center text-gray-400 py-3">
                                        No members found
                                      </p>
                                    )}
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
                              disabled={isPending || !newTaskTitle.trim()}
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
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-2 w-full py-2 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium mt-1 mb-2"
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
  );
};

export default KanbanGroup;
