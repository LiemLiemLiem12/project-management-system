import { Draggable, Droppable } from "@hello-pangea/dnd";
import KanbanItem from "./KanbanItem";
import { useState, useRef } from "react";
import { GroupTask } from "@/API/task.api";
import { useCreateTask } from "@/services/task.service";
import {
  CalendarIcon,
  UserCircleIcon,
  CornerDownLeftIcon,
  XIcon,
} from "lucide-react";

interface KanbanGroupProps {
  column: GroupTask;
  index: number;
  projectId: string;
}

const MOCK_MEMBERS = [
  { id: "1", name: "Hana", role: "Leader" },
  { id: "2", name: "John Doe", role: "Member" },
  { id: "3", name: "Alice", role: "Member" },
];

const KanbanGroup = ({ column, index, projectId }: KanbanGroupProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showMemberPopup, setShowMemberPopup] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || isPending) return;
    createTask(
      { title: newTaskTitle, group_task_id: column.id },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          setDueDate("");
          setIsCreating(false);
        },
      },
    );
  };

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

          {/* Bọc toàn bộ body bằng Droppable để kéo thả ở đâu trong cột cũng nhận */}
          <Droppable droppableId={column.id} type="TASK">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                // Thêm flex-1 để vùng kéo giãn hết chiều cao, tăng gap-3 để thẻ không bị dính
                className="flex-1 overflow-y-auto px-3 flex flex-col gap-3 pb-4"
              >
                {/* Render danh sách task */}
                {column.tasks.map((task, index) => (
                  <KanbanItem key={task.id} task={task} index={index} />
                ))}

                {/* Giữ lại placeholder bắt buộc của thư viện */}
                {provided.placeholder}

                {/* Quick Create UI được chuyển vào TRONG vùng kéo thả */}
                {isCreating ? (
                  <div className="bg-white rounded-lg shadow-sm p-3 mb-2 mt-1 border-none ring-0">
                    <textarea
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full text-sm border-none focus:ring-0 focus:outline-none outline-none resize-none p-0 min-h-[50px] placeholder:text-gray-300 shadow-none text-gray-700 bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleCreateTask();
                        }
                      }}
                    />

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 relative">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="relative flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => dateInputRef.current?.showPicker()}
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

                        <button
                          onClick={() => setShowMemberPopup(!showMemberPopup)}
                          className={`p-1 rounded transition-colors ${showMemberPopup ? "text-blue-500 bg-blue-50" : "hover:bg-gray-100"}`}
                        >
                          <UserCircleIcon size={16} />
                        </button>

                        {showMemberPopup && (
                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white shadow-xl border rounded-lg z-50 p-2 animate-in fade-in zoom-in duration-100">
                            <p className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase">
                              Assign to member
                            </p>
                            {MOCK_MEMBERS.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-md cursor-pointer group/item"
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white">
                                  {m.name.charAt(0)}
                                </div>
                                <span className="text-xs text-gray-600 font-medium">
                                  {m.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsCreating(false)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XIcon size={16} />
                        </button>
                        <button
                          onClick={handleCreateTask}
                          className="p-1 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-400 rounded transition-all"
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
                    <span className="text-lg">+</span> Add a card
                  </button>
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
