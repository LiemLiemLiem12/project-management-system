import { useAPI } from "@/API/useAPI";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useNotificationService = () => {
  const api = useAPI() as any; // Lấy instance tổng
  const queryClient = useQueryClient();

  // 1. Hook lấy danh sách thông báo
  const useGetNotifications = (unreadOnly: boolean) => {
    return useQuery({
      queryKey: ["notifications", unreadOnly],
      queryFn: async () => {
        // 🚀 Gọi qua API module đã tách
        const res = await api.notification.getNotifications(unreadOnly);
        return res.data;
      },
      refetchInterval: 30000, // Tự động refetch mỗi 30s
    });
  };

  // 2. Hook đánh dấu 1 thông báo đã đọc
  const markAsRead = useMutation({
    mutationFn: (id: string) => api.notification.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to mark as read"),
  });

  // 3. Hook đánh dấu tất cả đã đọc
  const markAllAsRead = useMutation({
    mutationFn: () => api.notification.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  return {
    useGetNotifications,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarkingAll: markAllAsRead.isPending,
  };
};
