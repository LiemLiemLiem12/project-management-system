"use client";
import { Plus, CheckSquare, Paperclip, Globe } from "lucide-react";

// Import các component con vừa tạo
import TaskSubtasks from "./TaskSubtasks";
import TaskChecklist from "./TaskChecklist";
import TaskAttachments from "./TaskAttachments";
import TaskActivity from "./TaskActivity";
import Tiptap from "../Tiptap";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

export default function TaskMainContent() {
  // Hàm xử lý cuộn mượt mà đến component tương ứng
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col max-w-4xl gap-8 pb-20">
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
        <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
          <Globe size={16} /> Web Links
        </button>
      </div>

      {/* 2. Description (Giữ nguyên như cũ) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <button className="text-sm font-medium text-blue-600 hover:underline">
            Edit
          </button>
        </div>
        {/* <input className=" w-full border-2 border-gray-300 focus:outline-none focus:border-primary p-4 bg-slate-50/50 text-slate-700 space-y-3"></input> */}
        <div className="w-full">
          <SimpleEditor />
        </div>
      </section>

      {/* 3. Render các Component đã tách (Các component này đều có ID tương ứng để cuộn tới) */}
      <TaskSubtasks />
      <TaskChecklist />
      <TaskAttachments />

      {/* 4. Activity/Comments (Nằm dưới cùng) */}
      <section id="section-activity" className="mt-4">
        <h2 className="text-lg font-semibold mb-4">Activity</h2>
        <TaskActivity />
      </section>
    </div>
  );
}
