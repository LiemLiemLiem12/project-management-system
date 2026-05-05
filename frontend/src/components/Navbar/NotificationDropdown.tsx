"use client";

import { Bell, CheckCheck } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationService } from "@/services/notification.service"; // 🚀 Import Hook vừa tạo

// Hàm helper tính khoảng thời gian (VD: "2 hours ago")
const timeAgo = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return "Just now";
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const router = useRouter();

  // 🚀 Gọi Service
  const { useGetNotifications, markAsRead, markAllAsRead, isMarkingAll } =
    useNotificationService();
  const { data: notifications = [], isLoading } =
    useGetNotifications(unreadOnly);

  // Đếm số lượng chưa đọc để chấm đỏ cái chuông
  const unreadCount = notifications.filter(
    (n: any) => !n.isRead || !n.is_read,
  ).length;

  // Xử lý khi click vào 1 thông báo
  const handleNotificationClick = (item: any) => {
    // Nếu chưa đọc thì call API mark as read
    if (!item.isRead && !item.is_read) {
      markAsRead(item.id);
    }

    // Đóng dropdown
    setIsOpen(false);

    // Nhảy tới trang đích (nếu có redirectUrl)
    if (item.redirectUrl || item.redirect_url) {
      router.push(item.redirectUrl || item.redirect_url);
    }
  };

  return (
    <div className="relative">
      <div
        className={`notification-bell p-2 rounded-md cursor-pointer relative transition-colors ${
          isOpen
            ? "bg-blue-100 text-blue-600"
            : "hover:text-blue-600 hover:bg-gray-50 text-gray-600"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell width={20} />
        {/* 🚀 Chấm đỏ chỉ hiện khi có thông báo chưa đọc */}
        {unreadCount > 0 && (
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-1.5 right-2 border-2 border-white"></div>
        )}
      </div>

      {/* Open Section */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute flex flex-col top-12 right-0 w-[420px] max-h-[600px] overflow-hidden bg-white shadow-2xl border border-gray-100 rounded-xl z-50">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 bg-white z-10">
              <p className="text-lg font-bold text-gray-800">Notifications</p>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                  />
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    Unread only
                  </span>
                </label>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    disabled={isMarkingAll}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 disabled:opacity-50"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List Section  */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-gray-400 animate-pulse">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Bell className="text-gray-300" size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {unreadOnly
                      ? "No unread notifications"
                      : "No notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((item: any) => {
                    const isUnread = !item.isRead && !item.is_read;
                    const avatarUrl = item.senderAvatar || item.sender_avatar;
                    const senderName =
                      item.senderName || item.sender_name || "System";

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`flex p-4 cursor-pointer transition-colors items-start gap-4 border-b border-gray-50 last:border-none relative
                          ${isUnread ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50 bg-white"}
                        `}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-blue-400 to-indigo-500 text-white font-bold text-sm overflow-hidden shadow-sm mt-0.5">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={senderName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            senderName.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <p
                            className={`text-[13px] leading-relaxed break-words ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                          >
                            {item.message || item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-semibold text-blue-600 tracking-wide uppercase">
                              {item.projectName || item.project_name}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {timeAgo(item.createdAt || item.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Unread dot indicator */}
                        {isUnread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0 shadow-sm"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
