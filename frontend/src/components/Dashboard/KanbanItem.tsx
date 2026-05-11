"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Task } from "@/API/task.api";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// 🚀 Thêm các import cần thiết
import { useProjectStore } from "@/store/project.store";
import { useDeleteTask } from "@/services/task.service";
import DeleteTaskModal from "@/components/Tasks/DeleteTaskModal";

interface KanbanItemProps {
  task: Task & { taskCode?: string }; // Hỗ trợ thêm taskCode nếu API trả về
  index: number;
}

const KanbanItem = ({ task, index }: KanbanItemProps) => {
  const router = useRouter();
  const param = useParams();
  const { projectId } = param as { projectId: string };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 🚀 Lấy thông tin Role và Members từ Store
  const currentUserRole = useProjectStore((s) => s.currentUserRole);
  const members = useProjectStore((s) => s.members);
  const isMember = currentUserRole === "Member";

  // Hook xóa Task
  const { mutate: deleteTask } = useDeleteTask(projectId);

  // Xử lý đóng menu 3 chấm khi bấm ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClick = () => {
    if (!projectId) return;
    router.push(`/project/${projectId}/${task.id}`);
  };

  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
    : null;

  // ==========================================
  // XỬ LÝ AVATAR NGƯỜI THỰC HIỆN
  // ==========================================
  const assignee = members?.find((m: any) => m.user_id === task.assignee_id);
  const assigneeName = assignee?.full_name || assignee?.user_id || "U";
  const assigneeInitial = String(assigneeName).charAt(0).toUpperCase();
  const avatarUrl = (assignee as any)?.avatar || (assignee as any)?.avatar_url;

  // 🚀 Sửa lỗi slice(0,6) cắn mất số 0
  const displayTaskId = task.task_id || task.id;

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            onClick={() => handleClick()}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white p-3.5 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing shrink-0 transition-shadow relative ${
              snapshot.isDragging
                ? "shadow-2xl ring-2 ring-blue-400 rotate-2 z-50"
                : "shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md"
            }`}
            style={{ ...provided.draggableProps.style }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2 relative">
              <h4 className="font-semibold text-[13px] text-[#172b4d] leading-snug pr-6">
                {task.title}
              </h4>

              {/* 🚀 Menu 3 chấm (Ẩn nếu là Member) */}
              {!isMember && (
                <div className="absolute -right-1 -top-1" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn không cho nhảy trang Detail
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors focus:outline-none"
                  >
                    {/* Icon 3 chấm được làm nhỏ lại */}
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-0.5 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn nhảy trang Detail
                          setIsMenuOpen(false);
                          setShowDeleteModal(true); // Bật Modal xóa
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Labels */}
            {task.labels?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border"
                    style={{
                      color: label.color_code,
                      borderColor: label.color_code,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-end text-[11px] text-[#6b778c] font-medium mt-1">
              <div className="flex gap-2 items-center">
                <span>#{displayTaskId}</span>
                {formattedDate && (
                  <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 text-gray-500">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* 🚀 AVATAR HOẶC CHỮ CÁI ĐẦU TIÊN */}
              {task.assignee_id && (
                <div className="flex-shrink-0" title={assigneeName}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={assigneeName}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold border border-white shadow-sm">
                      {assigneeInitial}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {/* 🚀 GỌI MODAL XÓA TASK */}
      {showDeleteModal && (
        <DeleteTaskModal
          taskCode={displayTaskId}
          onClose={() => setShowDeleteModal(false)}
          onArchive={() => setShowDeleteModal(false)}
          onConfirm={() => {
            deleteTask(task.id);
            setShowDeleteModal(false);
          }}
        />
      )}
    </>
  );
};

export default KanbanItem;
