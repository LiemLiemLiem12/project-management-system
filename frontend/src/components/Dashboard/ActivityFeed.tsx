"use client";

import { useParams } from "next/navigation";
import { useAuditStore } from "@/store/audit.store";
import { useAuthStore } from "@/store/auth.store";
import {
  useGetRecentActivities,
  useGetFeedActivities,
} from "@/services/audit.service";
import { useState } from "react"; // 🚀 Import useState

function ActivityRow({ data }: { data: any }) {
  const currentUser = useAuthStore((s: any) => s.user);

  const isMe =
    currentUser &&
    (data.user === currentUser.fullName ||
      data.user === currentUser.username ||
      data.user_id === currentUser.id);

  const avatar = isMe
    ? currentUser.avatarUrl
    : data.avatar_url || data.avatarUrl;

  const initial = data.user ? data.user.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex gap-3 py-4 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-full bg-[#0052CC] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 uppercase overflow-hidden">
        {avatar ? (
          <img
            src={avatar}
            alt={data.user || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-800 break-words leading-relaxed">
          <span className="font-semibold text-[#0052CC] hover:underline cursor-pointer">
            {isMe ? "You" : data.user}{" "}
          </span>{" "}
          <span className="text-gray-600">{data.action}</span>{" "}
          <span className="font-medium text-[#0052CC] hover:underline cursor-pointer">
            {data.task}
          </span>
          {data.status && (
            <span className="inline-block bg-[#00C853] text-white font-semibold px-1.5 py-0.5 ml-2 text-[10px] rounded-sm align-middle mb-0.5">
              {data.status}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">{data.time}</p>
      </div>
    </div>
  );
}

export default function ActivityFeed({
  targetUserId,
  myProjectIds = [],
}: {
  targetUserId?: string;
  myProjectIds?: string[];
}) {
  const params = useParams();
  const projectId = params.projectId as string;

  useGetRecentActivities(projectId);
  useGetFeedActivities(myProjectIds);

  const { activities, isLoading, error } = useAuditStore();

  // 🚀 STATE: Số lượng activity hiển thị (mặc định là 5)
  const [visibleCount, setVisibleCount] = useState(5);

  const filteredActivities = targetUserId
    ? activities.filter(
        (a) => a.user_id === targetUserId || a.user === targetUserId,
      )
    : activities;

  // 🚀 HÀM: Tải thêm 5 activity nữa mỗi khi bấm
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  // Cắt mảng data dựa theo visibleCount
  const displayedActivities = filteredActivities.slice(0, visibleCount);

  // Biến kiểm tra xem đã hiện hết data chưa (để ẩn cái nút Load More đi)
  const hasMore = filteredActivities.length > visibleCount;

  return (
    <section>
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {targetUserId ? "User's Activity" : "Recent Activity"}
      </h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 divide-y divide-gray-50">
          {isLoading ? (
            <p className="py-4 text-gray-500 text-sm animate-pulse">
              Loading activity...
            </p>
          ) : error ? (
            <p className="py-4 text-red-500 text-sm">{error}</p>
          ) : filteredActivities.length === 0 ? (
            <p className="py-4 text-gray-500 text-sm">
              {targetUserId
                ? "No activity found for this user."
                : "No activity found."}
            </p>
          ) : (
            displayedActivities.map((a) => (
              <ActivityRow key={`feed-${a.id}`} data={a} />
            ))
          )}
        </div>

        {/* 🚀 LOGIC HIỂN THỊ NÚT LOAD MORE */}
        {hasMore && !isLoading && !error && (
          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleLoadMore}
              className="w-full text-xs font-bold text-gray-400 hover:text-[#0052CC] tracking-widest uppercase transition-colors"
            >
              Load More Activity
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
