"use client";

import { Search, Plus } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { useAuthStore } from "@/store/auth.store";

export default function ProjectNavbar() {
  return (
    <>
      <div className="block lg:hidden">
        <div className="w-full px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex w-full gap-2 items-center">
            <div className="flex items-center flex-1 bg-gray-100 rounded-xl px-3 focus-within:bg-gray-200/60 transition-all">
              <Search className="text-gray-400 flex-shrink-0" size={16} />
              <input
                type="text"
                className="w-full py-2 pl-2 pr-1 bg-transparent outline-none text-sm placeholder-gray-400"
                placeholder=" Search anything..."
              />
            </div>

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
            <div className="flex items-center w-full max-w-md bg-gray-100 rounded-xl px-3 focus-within:bg-gray-200/60 transition-all">
              <Search className="text-gray-400 flex-shrink-0" size={16} />
              <input
                type="text"
                className="w-full py-2 pl-2 pr-1 bg-transparent outline-none text-sm placeholder-gray-400"
                placeholder=" Search anything..."
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap shadow-sm active:scale-95">
              <Plus size={18} />
              <span>Create</span>
            </button>
          </div>

          <div className="col-span-2 flex items-center justify-end gap-5">
            <NotificationDropdown />
            <div className="h-6 w-[1px] bg-gray-200" /> <UserDropdown />
          </div>
        </div>
      </div>
    </>
  );
}
