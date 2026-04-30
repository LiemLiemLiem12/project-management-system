"use client";

import { useAuditStore } from "@/store/audit.store";
import { useGetRecentActivities } from "@/services/audit.service";

function ActivityRow({ data }: { data: any }) {
  return (
    <div className="flex gap-3 py-4 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-full bg-[#0052CC] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 uppercase">
        {data.avatar || data.user?.charAt(0) || "U"}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-800 break-words leading-relaxed">
          <span className="font-semibold text-[#0052CC] hover:underline cursor-pointer">
            {data.user}
          </span>{" "}
          <span className="text-gray-600">{data.action}</span>{" "}
          <span className="font-medium text-[#0052CC] hover:underline cursor-pointer">
            {data.task}
          </span>
          <span className="inline-block bg-[#00C853] text-white font-semibold px-1.5 py-0.5 ml-2 text-[10px] rounded-sm align-middle mb-0.5">
            {data.status}
          </span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{data.time}</p>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  // Hook này sẽ tự động gọi API lấy log audit
  useGetRecentActivities();

  const { activities, isLoading, error } = useAuditStore();

  return (
    <section>
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Recent Activity
      </h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 divide-y divide-gray-50">
          {isLoading ? (
            <p className="py-4 text-gray-500 text-sm animate-pulse">
              Loading activity...
            </p>
          ) : error ? (
            <p className="py-4 text-red-500 text-sm">{error}</p>
          ) : activities.length === 0 ? (
            <p className="py-4 text-gray-500 text-sm">No activity found.</p>
          ) : (
            activities
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
