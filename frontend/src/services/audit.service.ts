"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAPI } from "@/API/useAPI";
import { useAuditStore } from "@/store/audit.store";
import { useProjectStore } from "@/store/project.store";
import { useAuthStore } from "@/store/auth.store";
const EMPTY_ARRAY: any[] = [];

// ==========================================
// HÀM 1: DÙNG CHO TAB "RECENT ACTIVITIES" (Của 1 Project cụ thể)
// ==========================================
export const useGetRecentActivities = (projectId: string) => {
  const api = useAPI();
  const setActivitiesData = useAuditStore((s: any) => s.setActivitiesData);
  const members = useProjectStore((s: any) => s.members) || [];

  // 🚀 Lôi AuthStore vào để biết "Tôi là ai"
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

    // 🕵️ Thêm 2 dòng này để nếu nó vẫn lỗi thì mình bật F12 lên là bắt được tận tay:
    console.log("🕵️ [Dashboard] Raw Log từ Backend:", query.data);
    console.log("🕵️ [Dashboard] Danh sách Members:", members);

    const formattedData = query.data.map((log: any) => {
      const dateObj = new Date(log.created_at);

      let displayName = `User ${log.user_id?.substring(0, 4) || "U"}`;

      // 1. Nếu là Hệ thống
      if (log.user_id === "unknown_user") {
        displayName = "Hệ thống";
      }
      // 2. Nếu ID trùng với ID của chính mình đang đăng nhập
      else if (log.user_id === currentUser?.id) {
        displayName =
          currentUser?.fullName ||
          currentUser?.full_name ||
          currentUser?.username ||
          "Tôi";
      }
      // 3. Nếu là ID của người khác trong team
      else {
        // Cải tiến: So sánh cả m.user_id lẫn m.id cho chắc cú
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
        user_id: log.user_id, // Truyền dư ra xíu để dễ debug
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

    // 1. LỌC NGHIÊM NGẶT: Chỉ giữ lại log có ID trùng khớp với tài khoản đang đăng nhập
    const myLogs = query.data.filter(
      (log: any) => log.user_id === currentUser?.id,
    );

    // 2. MAP DATA (Gán thẳng tên fullName của mình vào, khỏi cần dò mảng)
    const formattedData = myLogs.map((log: any) => {
      const dateObj = new Date(log.created_at);

      // Ưu tiên fullName như trong Console hiển thị
      const displayName =
        currentUser?.fullName ||
        currentUser?.full_name ||
        currentUser?.username ||
        "Tôi";

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

    // 3. GOM NHÓM THEO NGÀY
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
