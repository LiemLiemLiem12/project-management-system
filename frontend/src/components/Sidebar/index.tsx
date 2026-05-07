"use client";

import Image from "next/image";
import {
  User,
  Star,
  ChevronsLeft,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import ProjectItem from "./ProjectItem";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Dispatch, SetStateAction, useState, useMemo } from "react";
import { useProjectService } from "@/services/project.service";

export default function Sidebar() {
  const pathName = usePathname();
  const router = useRouter();

  // 🚀 Lấy data từ service
  const { projects, isLoadingProjects } = useProjectService();

  const [isOpenSidebar, setIsOpenSidebar]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(true);

  // 🛡️ BẢO VỆ DỮ LIỆU: Đảm bảo projects luôn là một mảng để không bị lỗi .map()
  const projectList = useMemo(() => {
    if (Array.isArray(projects)) return projects;
    if (projects?.data && Array.isArray(projects.data)) return projects.data;
    return [];
  }, [projects]);

  const isActive = (path: string) => pathName === path;

  const navLinkClass = (active: boolean) =>
    `flex relative overflow-hidden w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
      active
        ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
        : "hover:bg-slate-200"
    }`;

  return (
    <aside
      className={`h-screen overflow-hidden border-r border-slate-100 hidden md:flex flex-col bg-white p-4 transition-all duration-400 ease-in-out ${
        isOpenSidebar ? "w-64" : "w-20"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-6 px-2">
        {isOpenSidebar && <span className="text-lg font-bold">Popket</span>}
        <Image
          className="flex-shrink-0"
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
        />
      </div>

      <nav className="w-full flex-1 overflow-y-auto custom-scrollbar">
        {/* Navigation Links */}
        <div className="flex flex-col gap-1">
          <Link href="/for-you" className={navLinkClass(isActive("/for-you"))}>
            <User
              className={isOpenSidebar ? "w-4 h-4 shrink-0" : "w-5 h-5 mx-auto"}
            />
            {isOpenSidebar && <span className="truncate">For you</span>}
          </Link>
        </div>

        {/* Projects Section */}
        <div className="flex flex-col px-1 mt-6 gap-2">
          <div className="flex items-center justify-between px-2 h-8">
            {isOpenSidebar ? (
              <>
                <span className="uppercase font-medium text-slate-500 text-[10px] tracking-widest">
                  Recent Projects
                </span>
                <button
                  onClick={() => router.push("/create-project")}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/create-project")}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          {/* Render List */}
          {isOpenSidebar && (
            <div className="flex flex-col gap-0.5 mt-1">
              {isLoadingProjects ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              ) : projectList.length > 0 ? (
                projectList.map((project: any) => (
                  <ProjectItem
                    key={project.id}
                    label={project.name} // Hiện tên dự án từ bảng Projects thông qua Join
                    link={`/project/${project.id}`}
                  />
                ))
              ) : (
                <div className="px-3 py-4 border-2 border-dashed border-slate-50 rounded-xl">
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    No projects found. <br /> Create your first one!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer / Toggle */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors w-full"
        >
          {isOpenSidebar ? (
            <ChevronsLeft size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
          {isOpenSidebar && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
