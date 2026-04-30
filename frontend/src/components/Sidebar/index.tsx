"use client";

import Image from "next/image";
import {
  ChevronsUpDown,
  User,
  Star,
  ChevronsLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import ProjectItem from "./ProjectItem";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectContext } from "@/contexts/ProjectContext";
import { Dispatch, SetStateAction, useContext, useState } from "react";

export default function Sidebar() {
  const pathName = usePathname();
  const router = useRouter();
  const context = useContext(ProjectContext);

  const [isOpenSidebar, setIsOpenSidebar]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(true);

  const isActive = (path: string) => pathName === path;

  const navLinkClass = (active: boolean) =>
    `flex relative overflow-hidden w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
      active
        ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
        : "hover:bg-slate-200"
    }`;

  return (
    <aside
      className={`h-screen overflow-hidden border-r border-slate-100 hidden md:flex flex-col bg-white p-4
  transition-all duration-400 ease-in-out
  ${isOpenSidebar ? "w-64" : "w-20"}
  `}
    >
      {/* Logo */}
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

      <nav className="w-full flex-1 overflow-y-auto">
        {/* Main nav links */}
        <div className="project-items-group flex flex-col gap-1">
          <Link href="/for-you" className={navLinkClass(isActive("/for-you"))}>
            <User
              className={
                isOpenSidebar ? "w-4 h-4 flex-shrink-0" : "w-5 h-5 mx-auto"
              }
            />
            <span
              className={`transition-all duration-200 ease-in whitespace-nowrap ${
                isOpenSidebar
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              For you
            </span>
            {isActive("/for-you") && isOpenSidebar && (
              <span className="h-5 absolute left-0 border border-blue-700 rounded-full ml-auto" />
            )}
          </Link>

          <Link
            href="/favourites"
            className={navLinkClass(isActive("/favourites"))}
          >
            <Star
              className={
                isOpenSidebar ? "w-4 h-4 flex-shrink-0" : "w-5 h-5 mx-auto"
              }
            />
            <span
              className={`transition-all duration-200 ease-in whitespace-nowrap ${
                isOpenSidebar
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Favourites
            </span>
            {isActive("/favourites") && isOpenSidebar && (
              <span className="h-5 absolute left-0 border border-blue-700 rounded-full ml-auto" />
            )}
          </Link>
        </div>

        {/* Recent Group */}
        <div className="flex flex-col px-1 mt-6 gap-2 whitespace-nowrap">
          {isOpenSidebar && (
            <div className="flex items-center justify-between px-2">
              <span className="uppercase font-medium text-slate-500 text-xs tracking-wider">
                Recent
              </span>
              {/* New Project Button */}
              <button
                onClick={() => router.push("/create-project")}
                title="Create new project"
                className="flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          {!isOpenSidebar && (
            <button
              onClick={() => router.push("/create-project")}
              title="Create new project"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus size={18} />
            </button>
          )}

          {isOpenSidebar && (
            <div className="flex flex-col gap-1">
              <ProjectItem label="Project 1" link="/project/1" />
              <ProjectItem label="Project 1" link="/project/1" />
              <ProjectItem label="Project 2" link="/project/2" />
              <ProjectItem label="Project 3" link="/project/3" />
              <ProjectItem label="Project 4" link="/project/4" />
            </div>
          )}
        </div>
      </nav>

      {/* Collapse Button */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
          className="flex items-center whitespace-nowrap gap-3 px-3 py-2 text-sm text-slate-500 cursor-pointer hover:text-slate-800 transition-colors w-full"
        >
          {isOpenSidebar ? (
            <ChevronsLeft size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
          {isOpenSidebar && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
