"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAPI } from "@/API/useAPI";
import { useAuditStore } from "@/store/audit.store";
import { useProjectStore } from "@/store/project.store";
import { useAuthStore } from "@/store/auth.store";
const EMPTY_ARRAY: any[] = [];

export const useGetRecentActivities = (projectId: string) => {
  const api = useAPI();
  const setActivitiesData = useAuditStore((s: any) => s.setActivitiesData);
  const members = useProjectStore((s: any) => s.members) || [];

  const currentUser = useAuthStore((s: any) => s.user);

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
    if (!query.data || query.isFetching) return;

    const formattedData = query.data.map((log: any) => {
      const dateObj = new Date(log.created_at);

      let displayName = `User ${log.user_id?.substring(0, 4) || "U"}`;

      // 1. Nếu là Hệ thống
      if (log.user_id === "unknown_user") {
        displayName = "System";
      }
      // 2. Nếu ID trùng với ID của chính mình đang đăng nhập
      else if (log.user_id === currentUser?.id) {
        displayName =
          currentUser?.fullName ||
          currentUser?.full_name ||
          currentUser?.username ||
          "Me";
      } else {
        const memberInfo = members.find(
          (m: any) => m.user_id === log.user_id || m.id === log.user_id,
        );
        if (memberInfo) {
          displayName =
            memberInfo.full_name ||
            memberInfo.fullName ||
            memberInfo.username ||
            displayName;
        }
      }

      return {
        id: log.id,
        user_id: log.user_id,
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
  }, [query.data, query.isFetching, members, currentUser, setActivitiesData]);

  return query;
};
export const useGetFeedActivities = (projectIds: string[]) => {
  const api = useAPI();
  const setActivitiesData = useAuditStore((s: any) => s.setActivitiesData);
  const currentUser = useAuthStore((s: any) => s.user); // Lấy thông tin user từ Store

  const query = useQuery({
    queryKey: ["feedActivities", projectIds],
    queryFn: async () => {
      if (!projectIds || projectIds.length === 0) return [];
      const res = await api.audit.getFeedActivities(projectIds);
      return res.data;
    },
    enabled: projectIds.length > 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!projectIds || projectIds.length === 0 || !query.data) {
      setActivitiesData([], {});
      return;
    }

    if (query.isFetching) return;

    const myLogs = query.data.filter(
      (log: any) => log.user_id === currentUser?.id,
    );

    const formattedData = myLogs.map((log: any) => {
      const dateObj = new Date(log.created_at);

      // Ưu tiên fullName như trong Console hiển thị
      const displayName =
        currentUser?.fullName ||
        currentUser?.full_name ||
        currentUser?.username ||
        "Me";

      return {
        id: log.id,
        user_id: log.user_id,
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
  }, [
    projectIds,
    query.data,
    query.isFetching,
    currentUser,
    setActivitiesData,
  ]);

  return query;
};

export const useGetAuditLog = (
  field: string,
  value: string,
  limit: number = 10,
  offset: number = 0,
) => {
  const api = useAPI();
  const query = useQuery({
    queryKey: ["audit", field, value, limit, offset],
    queryFn: async () => {
      const res = await api.audit.getLogsByField(field, value, limit, offset);
      return res.data;
    },
    enabled: !!field && !!value,
    refetchOnWindowFocus: false,
  });

  return query;
};
