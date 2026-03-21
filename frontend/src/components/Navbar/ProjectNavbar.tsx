import { Search } from "lucide-react";
import { Plus, Bell } from "lucide-react";
import Image from "next/image";
import NotificationDropdown from "./NotificationDropdown";

export default function ProjectNavbar() {
  return (
    <>
      <div className="block lg:hidden">
        <div className="w-full px-5 py-3">
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <Search className="absolute text-gray-500 left-1 top-1/6" />
              <input
                type="text"
                className="pl-9 pr-2 w-full focus:border-0 py-2 bg-gray-200 rounded-xl"
                placeholder="Search anything..."
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-3 px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                <Plus width={20} />
                <p>Create</p>
              </div>
              <div className="w-10 h-10 cursor-pointer border border-primary relative overflow-hidden rounded-full bg-gray-300 mt-1">
                <Image
                  objectFit="cover"
                  src={"/avatar.jpg"}
                  alt="avatar"
                  fill
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="w-full grid grid-cols-5 gap-4 px-5 py-3">
          <div className="col-span-3 flex items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute text-gray-500 left-1 top-1/6" />
              <input
                type="text"
                className="pl-9 pr-2 w-full focus:border-0 py-2 bg-gray-200 rounded-xl"
                placeholder="Search anything..."
              />
            </div>

            <div className="flex items-center gap-3 px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
              <Plus width={20} />
              <p>Create</p>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-end gap-4">
            <NotificationDropdown />
            <div className="flex flex-row items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-200 rounded-xl">
              <div className="flex flex-col">
                <p className="font-semibold">Alex Rivera</p>
                <p className="text-sm text-dark">Project Manager</p>
              </div>
              <div className="w-12 h-12 border border-primary relative overflow-hidden rounded-full bg-gray-300 mt-1">
                <Image src={"/avatar.jpg"} alt="avatar" fill />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
