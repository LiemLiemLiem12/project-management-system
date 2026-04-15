"use client";

import ProjectDetailNavbar from "@/components/Navbar/ProjectDetailNavbar";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { projectId }: any = useParams();

  return (
    <div className="flex flex-col h-full">
      {/* Navbar fixed */}
      <div className="bg-white z-10">
        <ProjectDetailNavbar />
      </div>

      {/* Content scroll */}
      <div className="flex-1 overflow-x-auto">{children}</div>
    </div>
  );
}
