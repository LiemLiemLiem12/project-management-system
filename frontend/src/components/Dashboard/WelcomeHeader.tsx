"use client";

import { useAuthStore } from "@/store/auth.store";

export default function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);

  const displayName =
    user?.fullName ||
    (user?.username ? user.username.split("@")[0] : null) ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Guest";

  // Format ngày tháng hiển thị
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Đổi lời chào theo buổi
  const currentHour = today.getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  return (
    <div className="flex flex-col gap-1.5 mb-2">
      <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {dateString}
      </p>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
        {greeting},{" "}
        <span className="text-blue-600 capitalize">{displayName}</span>
      </h1>
    </div>
  );
}
