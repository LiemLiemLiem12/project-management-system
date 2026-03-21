"use client";

import Image from "next/image";
import {
  ChevronsUpDown,
  User,
  Star,
  ChevronsLeft,
  ChevronRight,
} from "lucide-react";
import ProjectItem from "./ProjectItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ProjectContext } from "@/contexts/ProjectContext";
import { Dispatch, SetStateAction, useContext, useState } from "react";

export default function Sidebar() {
  const pathName = usePathname();
  const context = useContext(ProjectContext);

  const [isOpenSidebar, setIsOpenSidebar]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(true);

  return (
    <aside
      className={`h-screen overflow-hidden border-slate-100 hidden md:flex flex-col bg-white p-4
  transition-all duration-400 ease-in-out
  ${isOpenSidebar ? "w-64" : "w-20"}
  `}
    >
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

      <nav className="w-full flex-1">
        <div className="project-items-group flex flex-col gap-1">
          {pathName === "/for-you" ? (
            <Link
              href="/for-you"
              className="flex relative overflow-hidden g-2 w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-blue-700 cursor-pointer bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <User
                className={isOpenSidebar ? "w-4 h-4" : "w-full flex-shrink-0"}
              />
              <span
                className={`transition-all duration-200 ease-in whitespace-nowrap ${isOpenSidebar ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
              >
                For you
              </span>
              {isOpenSidebar && (
                <span className=" h-5 absolute left-0 border border-blue-700 rounded-full ml-auto"></span>
              )}
            </Link>
          ) : (
            <Link
              href="/for-you"
              className="flex relative overflow-hidden g-2 w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium  cursor-pointer  hover:bg-slate-200 transition-colors"
            >
              <User
                className={isOpenSidebar ? "w-4 h-4" : "w-full flex-shrink-0"}
              />
              <span
                className={`transition-all duration-200 ease-in whitespace-nowrap ${isOpenSidebar ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
              >
                For you
              </span>
            </Link>
          )}
          {pathName === "/favourites" ? (
            <Link
              href="/favourites"
              className="flex relative overflow-hidden g-2 w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-blue-700 cursor-pointer bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <Star
                className={isOpenSidebar ? "w-4 h-4" : "w-full flex-shrink-0"}
              />
              <span
                className={`transition-all duration-200 ease-in whitespace-nowrap ${isOpenSidebar ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
              >
                Favourites
              </span>
              {isOpenSidebar && (
                <span className=" h-5 absolute left-0 border border-blue-700 rounded-full ml-auto"></span>
              )}
            </Link>
          ) : (
            <Link
              href="/favourites"
              className="flex relative overflow-hidden g-2 w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium  cursor-pointer  hover:bg-slate -200 transition-colors"
            >
              <Star
                className={isOpenSidebar ? "w-4 h-4" : "w-full flex-shrink-0"}
              />
              <span
                className={`transition-all duration-200 ease-in whitespace-nowrap ${isOpenSidebar ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
              >
                Favourites
              </span>
            </Link>
          )}
        </div>

        {/* Recent Group  */}
        {isOpenSidebar && (
          <div className="flex flex-col px-3 mt-6 gap-2 whitespace-nowrap">
            <span className="uppercase font-regular text-slate-500 text-sm tracking-wide">
              Recent
            </span>

            <div className="flex flex-col gap-1">
              <ProjectItem label="Project 1" link="/project/1" />
              <ProjectItem label="Project 1" link="/project/1" />
              <ProjectItem label="Project 2" link="/project/2" />
              <ProjectItem label="Project 3" link="/project/3" />
              <ProjectItem label="Project 4" link="/project/4" />
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-50">
        <button
          onClick={() => {
            setIsOpenSidebar(!isOpenSidebar);
          }}
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
