"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import React from "react";

const data = [
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
  {
    image: "/avatar.jpg",
    label: "You have 1 overdue item",
    ProjectName: "Project Alpha",
    time: "2 hours ago",
  },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = React.useState(false);
  return (
    <div className="relative">
      <div
        className={`notification-bell p-2 rounded-md cursor-pointer relative ${isOpen ? "bg-blue-200 text-blue-600" : "hover:text-primary"}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell width={20} className="" />
        <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2"></div>
      </div>

      {/* Open Section */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute top-12 right-0 w-130 bg-white shadow-lg px-7 py-5 z-20">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-bold text-dark">Notifications</p>

              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-500">
                  Only show unread
                </p>

                <input type="checkbox" className="" />
              </div>
            </div>

            {/* Notification Main Section  */}
            <p className="text-sm font-medium text-gray-500 mt-7">Today</p>
            <div className="flex flex-col gap-4 mt-4 max-h-[600px] overflow-y-auto">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex p-4 overflow-hidden cursor-pointer hover:bg-gray-100 items-center gap-4"
                >
                  <div className="w-10 h-10 overflow-hidden rounded-lg relative">
                    <Image
                      objectFit="cover"
                      fill
                      src={item.image}
                      alt="avatar"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-dark">
                      {item.label}{" "}
                      <span className="text-xs text-gray-500">
                        ({item.time})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">{item.ProjectName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
