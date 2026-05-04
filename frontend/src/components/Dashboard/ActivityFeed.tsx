"use client";

import { useParams } from "next/navigation";
import { useAuditStore } from "@/store/audit.store";
import { useAuthStore } from "@/store/auth.store"; // 🚀 ĐÃ IMPORT STORE CỦA ÔNG
import {
  useGetRecentActivities,
  useGetFeedActivities,
} from "@/services/audit.service";

function ActivityRow({ data }: { data: any }) {
  // 🚀 Móc thông tin user đang đăng nhập từ Zustand Store
  const currentUser = useAuthStore((s: any) => s.user);

  // Kiểm tra xem hành động này có phải của mình không (so sánh tên hoặc ID)
  const isMe =
    currentUser &&
    (data.user === currentUser.fullName ||
      data.user === currentUser.username ||
      data.user_id === currentUser.id);

  // 🚀 LOGIC LẤY ẢNH ƯU TIÊN:
  // 1. Nếu là hành động của mình -> Lấy ảnh trực tiếp từ Store (nhanh & luôn mới nhất)
  // 2. Nếu của người khác -> Lấy từ data API (nếu có)
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
            {/* Nếu là mình thì đổi tên thành "You" cho xịn */}
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

  const filteredActivities = targetUserId
    ? activities.filter(
        (a) => a.user_id === targetUserId || a.user === targetUserId,
      )
    : activities;

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
            filteredActivities
              .slice(0, 5)
              .map((a) => <ActivityRow key={`feed-${a.id}`} data={a} />)
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <button className="w-full text-xs font-bold text-gray-400 hover:text-[#0052CC] tracking-widest uppercase transition-colors">
            Load More Activity
          </button>
        </div>
      </div>
    </section>
  );
}
