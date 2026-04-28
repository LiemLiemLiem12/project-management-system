import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAPI } from "@/API/useAPI";
import { useAuditStore } from "@/store/audit.store";

export const useGetRecentActivities = () => {
  const api = useAPI();
  const setActivitiesData = useAuditStore((s) => s.setActivitiesData);

  const query = useQuery({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const res = await api.audit.getRecentLogs();
      return res.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      // 1. Format dữ liệu
      const formattedData = query.data.map((log: any) => {
        const dateObj = new Date(log.created_at);
        return {
          id: log.id,
          user:
            log.user_id === "unknown_user"
              ? "Hệ thống"
              : `User ${log.user_id.substring(0, 4)}`,
          avatar:
            log.user_id === "unknown_user"
              ? "SYS"
              : log.user_id.substring(0, 2).toUpperCase(),
          action: log.action.replace(/_/g, " ").toLowerCase(),
          task: `${log.entity_type} ID: ${log.entity_id.substring(0, 8)}...`,
          status: log.status || "DONE",
          time: dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };
      });

      // 2. Gom nhóm theo ngày
      const grouped = formattedData.reduce((acc: any, current: any) => {
        if (!acc[current.date]) acc[current.date] = [];
        acc[current.date].push(current);
        return acc;
      }, {});

      // 3. Quăng vào Store
      setActivitiesData(formattedData, grouped);
    }
  }, [query.data, setActivitiesData]);

  return query;
};
