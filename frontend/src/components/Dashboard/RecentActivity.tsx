"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useAuditStore } from "@/store/audit.store";
import { useGetRecentActivities } from "@/services/audit.service";

import { useGetProjectMembers } from "@/services/project.service";

export default function RecentActivity() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams();
  const projectId = params.projectId as string;

  // 1. Gọi API lấy danh sách Audit Logs
  useGetRecentActivities(projectId);

  // 🚀 2. Gọi API lấy danh sách Members của Project để map data
  const { data: members = [], isLoading: isLoadingMembers } =
    useGetProjectMembers(projectId);

  const { activities, groupedActivities, isLoading, error } = useAuditStore();

  // 🚀 3. Tự động dò tìm thông tin User trong ActivityItem
  const ActivityItem = ({ data }: { data: any }) => {
    // Cố gắng tìm member trùng khớp (Check cả id hoặc user_id tùy theo cách ông lưu trong database)
    const member = members.find(
      (m: any) =>
        m.id === data.user_id ||
        m.user_id === data.user_id ||
        m.id === data.user,
    );

    // Xác định Tên hiển thị (Nếu tìm thấy member -> lấy full_name, không thì giữ nguyên data cũ)
    const actorName = member?.full_name
      ? member.full_name
      : data.user?.includes("Hệ thống") || !data.user_id
        ? "Hệ thống"
        : data.user;

    // Xác định Avatar (Nếu có link ảnh thì hiện ảnh, ko thì lấy chữ cái đầu của tên)
    const avatarContent = member?.avatar_url ? (
      <img
        src={member.avatar_url}
        alt={actorName}
        className="w-full h-full object-cover rounded-full"
      />
    ) : (
      actorName.charAt(0).toUpperCase()
    );

    return (
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-sm">
          {avatarContent}
        </div>
        <div>
          <p className="text-md text-gray-800">
            <span className="text-[#0052CC] font-bold cursor-pointer hover:underline">
              {actorName}
            </span>{" "}
            <span className="text-gray-600">{data.action}</span>{" "}
            <span className="inline-flex items-center gap-1 text-[#0052CC] font-medium cursor-pointer hover:underline">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {data.task}
            </span>{" "}
            {data.status && (
              <span className="inline-block bg-[#00C853] text-white font-semibold px-1.5 py-0.5 ml-1 text-[10px] rounded uppercase tracking-wide">
                {data.status}
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{data.time}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="max-w-3xl border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-black">Recent Activity</h2>
            <p className="text-sm text-gray-600">
              Stay up to date with what’s happening
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            <span className="text-sm text-gray-600 font-medium">Expand</span>
          </button>
        </div>

        <div>
          {isLoading || isLoadingMembers ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No recent activity found in this project.
            </p>
          ) : (
            activities
              .slice(0, 5)
              .map((item) => (
                <ActivityItem key={`card-${item.id}`} data={item} />
              ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col m-4 z-20 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  All Recent Activity
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Detailed view of everything happening in this project
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {Object.keys(groupedActivities).map((dateKey) => (
                <div key={dateKey} className="mb-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                    {dateKey}
                  </h3>
                  {groupedActivities[dateKey].map((item: any) => (
                    <ActivityItem key={`modal-${item.id}`} data={item} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
