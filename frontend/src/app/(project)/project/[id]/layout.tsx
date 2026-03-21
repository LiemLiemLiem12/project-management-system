"use client";

import ProjectDetailNavbar from "@/components/Navbar/ProjectDetailNavbar";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { id }: any = useParams();

  return (
    <div className="flex flex-col h-full">
      {/* Navbar fixed */}
      <div className="bg-white z-10">
        <ProjectDetailNavbar />
      </div>

      {/* Content scroll */}
      <div className="flex-1 px-15 md:px-20  overflow-y-auto">{children}</div>
    </div>
  );
}
