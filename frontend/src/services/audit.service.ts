"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAPI } from "@/API/useAPI";
import { useAuditStore } from "@/store/audit.store";
import { useProjectStore } from "@/store/project.store";

export const useGetRecentActivities = (projectId: string) => {
  const api = useAPI();
  const setActivitiesData = useAuditStore((s) => s.setActivitiesData);
  const members = useProjectStore((s) => s.members) || [];

  const query = useQuery({
    queryKey: ["recentActivities", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.audit.getRecentLogs(projectId);
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      const formattedData = query.data.map((log: any) => {
        const dateObj = new Date(log.created_at);
        const memberInfo = members.find((m: any) => m.user_id === log.user_id);
        const displayName =
          log.user_id === "unknown_user"
            ? "Hệ thống"
            : memberInfo?.full_name || `User ${log.user_id.substring(0, 4)}`;

        return {
          id: log.id,
          user: displayName,
          avatar: displayName.substring(0, 2).toUpperCase(),
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

      const grouped = formattedData.reduce((acc: any, current: any) => {
        if (!acc[current.date]) acc[current.date] = [];
        acc[current.date].push(current);
        return acc;
      }, {});

      setActivitiesData(formattedData, grouped);
    }
  }, [query.data, setActivitiesData, members]);

  return query;
};
// Dán đoạn này vào dưới cùng của file audit.service.ts nhé

export const useGetFeedActivities = (projectIds: string[]) => {
  const api = useAPI();
  const setActivitiesData = useAuditStore((s) => s.setActivitiesData);
  const members = useProjectStore((s) => s.members) || []; // Kéo member ra để map tên

  const query = useQuery({
    queryKey: ["feedActivities", projectIds],
    queryFn: async () => {
      // Nếu mảng rỗng thì không gọi API
      if (!projectIds || projectIds.length === 0) return [];

      // 🚀 Gọi API getFeedActivities bên api/useAPI.ts
      const res = await api.audit.getFeedActivities(projectIds);
      return res.data;
    },
    enabled: projectIds.length > 0, // Chỉ chạy khi có projectIds
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      // Format dữ liệu giống hệt như lấy 1 project
      const formattedData = query.data.map((log: any) => {
        const dateObj = new Date(log.created_at);
        const memberInfo = members.find((m: any) => m.user_id === log.user_id);
        const displayName =
          log.user_id === "unknown_user"
            ? "Hệ thống"
            : memberInfo?.full_name ||
              `User ${log.user_id?.substring(0, 4) || "U"}`;

        return {
          id: log.id,
          user: displayName,
          avatar: displayName.substring(0, 2).toUpperCase(),
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

      const grouped = formattedData.reduce((acc: any, current: any) => {
        if (!acc[current.date]) acc[current.date] = [];
        acc[current.date].push(current);
        return acc;
      }, {});

      setActivitiesData(formattedData, grouped);
    }
  }, [query.data, setActivitiesData, members]);

  return query;
};
