"use client";
import IconLoader from "@/components/IconLoader";
import TaskMainContent from "@/components/TaskDetail/TaskMainContent";
import TaskSidebar from "@/components/TaskDetail/TaskSidebar";
import useGetProjectRole from "@/hooks/use-get-project-role";
import { useGetCurrentTask } from "@/services/task.service";
import { useProjectStore } from "@/store/project.store";
import { useTaskStore } from "@/store/task.store";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function TaskDetailPage() {
  const param = useParams();
  const { projectId, taskId } = param;
  const { data } = useGetCurrentTask(projectId! as string, taskId! as string);
  const currentProject = useProjectStore((s) => s.currentProject);

  useGetProjectRole();

  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center h-full ">
        <IconLoader size={50} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 ">
      {/* Thanh Header trên cùng */}
      <div className="flex gap-2 px-8 py-2 w-full justify-start items-center">
        <a href="/for-you" className="hover:text-primary">
          Workspace
        </a>
        <span>/</span>
        <a
          className="hover:text-primary"
          href={`/project/${currentProject?.id}`}
        >
          {currentProject ? currentProject?.name : ""}
        </a>
        <span>/</span>

        <a className="text-primary hover:text-blue-600" href="">
          {data?.id || "Task Title"}
        </a>
      </div>

      {/* Khu vực nội dung chia 2 cột */}
      <div className="flex flex-1 h-full overflow-hidden border-slate-200">
        {/* Cột trái: Nội dung chính (Title, Description, Checklist) */}
        <div className="flex-1 h-full overflow-y-auto p-8 lg:px-12">
          <TaskMainContent />
        </div>

        {/* Cột phải: Sidebar thông tin (Assignee, Labels, Automation) */}
        <div className="hidden lg:block w-[380px] h-full overflow-y-auto border-l p-8 border-slate-100 bg-slate-50/30">
          <TaskSidebar />
        </div>
      </div>
    </div>
  );
}
