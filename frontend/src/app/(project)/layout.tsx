"use client";

import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import Sidebar from "@/components/Sidebar";
import { useProjectService } from "@/services/project.service";
import { useParams, notFound } from "next/navigation";
import { useEffect } from "react";

const RESERVED_ROUTES = ["for-you", "favourite", "settings"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params?.projectId as string;

  const { getProject } = useProjectService();

  useEffect(() => {
    if (!projectId) return;

    if (RESERVED_ROUTES.includes(projectId)) {
      return;
    }

    getProject(projectId);
  }, [projectId]);

  return (
    <div className="h-screen w-full overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 h-full min-w-0 flex flex-col">
        <div className="h-14 bg-white z-20">
          <ProjectNavbar />
        </div>
        <div className="flex-1 mt-5 min-h-0 bg-gray-50">{children}</div>
      </div>
    </div>
  );
}
