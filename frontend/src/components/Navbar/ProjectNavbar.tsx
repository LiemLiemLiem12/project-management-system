"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { useAuthStore } from "@/store/auth.store";
import { useGetMyTasks } from "@/services/task.service";
import Link from "next/link";

// ─── COMPONENT GLOBAL SEARCH (GIỮ NGUYÊN 100% UI GỐC) ──────────────────────
const GlobalSearch = ({
  containerClassName,
}: {
  containerClassName: string;
}) => {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: myTasks, isLoading } = useGetMyTasks();

  const filteredTasks =
    myTasks?.filter((task: any) =>
      task.title?.toLowerCase().includes(keyword.toLowerCase()),
    ) || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTask = (task: any) => {
    const projectId = task.groupTask?.project_id || task.project_id;
    if (projectId) {
      router.push(`/project/${projectId}/${task.id}`);
      setIsOpen(false);
      setKeyword("");
    }
  };

  return (
    // 🚀 Bê nguyên class gốc của ông vào đây, chỉ thêm chữ "relative" để canh vị trí Dropdown
    <div
      ref={wrapperRef}
      className={`relative flex items-center bg-gray-100 rounded-xl px-3 focus-within:bg-gray-200/60 transition-all ${containerClassName}`}
    >
      <Search className="text-gray-400 flex-shrink-0" size={16} />
      <input
        type="text"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full py-2 pl-2 pr-1 bg-transparent outline-none text-sm placeholder-gray-400"
        placeholder=" Search anything..."
      />
      {isLoading && keyword && (
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
      )}

      {/* Dropdown Kết Quả */}
      {isOpen && keyword.trim().length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
          <div className="max-h-[300px] overflow-y-auto py-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col gap-1 transition-colors border-b border-gray-50 last:border-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                      {task.title}
                    </span>
                    {task.isSuccess && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-600 font-medium">
                      {task.id.substring(0, 8)}...
                    </span>
                    {task.groupTitle && (
                      <>
                        <span>•</span>
                        <span className="line-clamp-1">{task.groupTitle}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── NAVBAR CHÍNH ─────────────────────────────────────────────────────────────
export default function ProjectNavbar() {
  return (
    <>
      <div className="block lg:hidden">
        <div className="w-full px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex w-full gap-2 items-center">
            {/* 🚀 Mobile: Truyền đúng class flex-1 của ô search cũ */}
            <GlobalSearch containerClassName="flex-1" />

            <div className="flex gap-2 items-center flex-shrink-0">
              <button className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                <Plus size={20} />
              </button>
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block border-b border-gray-100 bg-white">
        <div className="w-full grid grid-cols-5 gap-4 px-5 py-3">
          <div className="col-span-3 flex items-center gap-4">
            {/* 🚀 Desktop: Truyền đúng class w-full max-w-md của ô search cũ */}
            <GlobalSearch containerClassName="w-full max-w-md" />

            <Link href="/create-project">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap shadow-sm active:scale-95">
                <Plus size={18} />
                <span>Create</span>
              </button>
            </Link>
          </div>

          <div className="col-span-2 flex items-center justify-end gap-5">
            <NotificationDropdown />
            <div className="h-6 w-[1px] bg-gray-200" />
            <UserDropdown />
          </div>
        </div>
      </div>
    </>
  );
}
