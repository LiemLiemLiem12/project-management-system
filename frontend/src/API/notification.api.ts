import { AxiosInstance } from "axios";

export const NotificationAPI = (api: AxiosInstance) => ({
  // Lấy danh sách thông báo
  getNotifications: (unreadOnly: boolean) =>
    api.get(`/notification?unreadOnly=${unreadOnly}`),

  // Đánh dấu 1 thông báo đã đọc
  markAsRead: (id: string) => api.patch(`/notification/${id}/read`),

  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => api.patch(`/notification/read-all`),
});
