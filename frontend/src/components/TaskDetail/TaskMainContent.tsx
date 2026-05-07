"use client";
import { Plus, CheckSquare, Paperclip, Globe } from "lucide-react";

// Import các component con vừa tạo
import TaskSubtasks from "./TaskSubtasks";
import TaskChecklist from "./TaskChecklist";
import TaskAttachments from "./TaskAttachments";
import TaskActivity from "./TaskActivity";
import Tiptap from "../Tiptap";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";
import { useTaskStore } from "@/store/task.store";
import { useProjectStore } from "@/store/project.store";
import { useAutoSaveTaskField } from "@/hooks/use-autosave-task-field";
import { ROLE } from "@/enums";
import { FileStoringModal } from "./FileStoringModal";
import { useState } from "react";

export default function TaskMainContent() {
  const [openStoreModal, setOpenStoreModal] = useState<boolean>(false);
  const currentTask = useTaskStore((s) => s.currentTask);

  const currentProject = useProjectStore((s: any) => s.currentProject?.id);

  const currentUserRole = useProjectStore((s) => s.currentUserRole);

  const canManage =
    currentUserRole === ROLE.LEADER || currentUserRole === ROLE.MODERATOR;

  // Hook cho
  const [title, setTitle] = useAutoSaveTaskField({
    projectId: currentProject,
    taskId: currentTask?.id,
    field: "title",
    initialValue: currentTask?.title || "",
  });

  const [description, setDescription] = useAutoSaveTaskField({
    projectId: currentProject,
    taskId: currentTask?.id,
    field: "description",
    initialValue: currentTask?.description || "",
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col max-w-4xl gap-8 pb-20">
      <input
        disabled={!canManage}
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold border-b border-slate-300 mb-4 bg-transparent"
        value={title}
      />
      {/* 1. Thanh Toolbar điều hướng nội bộ */}
      <div className="flex items-center gap-4 text-sm font-medium text-slate-600 border-b border-slate-100 pb-4">
        <button
          onClick={() => scrollToSection("section-subtasks")}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          <Plus size={16} /> Subtasks
        </button>
        <button
          onClick={() => scrollToSection("section-checklist")}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          <CheckSquare size={16} /> Checklist
        </button>
        <button
          onClick={() => scrollToSection("section-attachments")}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          <Paperclip size={16} /> Attachment
        </button>
      </div>

      {/* 2. Description (Giữ nguyên như cũ) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Description</h2>
        </div>
        {/* <input className=" w-full border-2 border-gray-300 focus:outline-none focus:border-primary p-4 bg-slate-50/50 text-slate-700 space-y-3"></input> */}
        <div className="w-full">
          <SimpleEditor
            onChange={(htmlContent: string) => {
              setDescription(htmlContent);
            }}
            initialContent={currentTask?.description}
            readOnly={!canManage}
          />
        </div>
      </section>

      {/* 3. Render các Component đã tách (Các component này đều có ID tương ứng để cuộn tới) */}
      <TaskSubtasks canManage={canManage} />
      <TaskChecklist canManage={canManage} />
      <TaskAttachments onOpenModal={() => setOpenStoreModal(true)} />

      {/* 4. Activity/Comments (Nằm dưới cùng) */}
      <section id="section-activity" className="mt-4">
        <h2 className="text-lg font-semibold mb-4">Activity</h2>
        <TaskActivity />
      </section>

      <FileStoringModal
        isOpen={openStoreModal}
        onClose={() => setOpenStoreModal(false)}
      />
    </div>
  );
}
