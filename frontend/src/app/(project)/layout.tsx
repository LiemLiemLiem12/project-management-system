"use client";

import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import Sidebar from "@/components/Sidebar";
import { useGetCurrentProject } from "@/services/project.service";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const RESERVED_ROUTES = ["for-you", "favourite"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params?.projectId as string;

  const { isLoading, data } = useGetCurrentProject(projectId);

  const isProjectPage = !!projectId && !RESERVED_ROUTES.includes(projectId);

  return (
    <div className="h-screen w-full overflow-hidden flex">
      <Sidebar />

      <div className="flex-1 h-full min-w-0 flex flex-col">
        {/* Navbar */}
        <div className="h-14 bg-white z-20">
          <ProjectNavbar />
        </div>

        {/* Content */}
        <div className="flex-1 mt-5 min-h-0 bg-gray-50">
          {/* Nếu đang ở trang Project VÀ dữ liệu đang tải -> Hiện loading */}
          {isProjectPage && (isLoading || !data) ? (
            <div className="p-10 text-center text-slate-500 font-medium animate-pulse">
              Loading project data...
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
