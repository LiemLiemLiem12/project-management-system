"use client";

import { Check, FileEdit, Layers, CalendarClock } from "lucide-react";
import QuickStaticCard from "./QuickStaticCard";
import { useTaskStore } from "@/store/task.store";
import { useMemo } from "react";

const QuickStatisticCardList = () => {
  const groups = useTaskStore((s) => s.groups) || [];

  const stats = useMemo(() => {
    let completedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    let dueSoonCount = 0;

    // Các mốc thời gian
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const now = new Date();

    // Duyệt qua từng group
    groups.forEach((group) => {
      // 🚀 Xác định cột này có phải là cột DONE không
      const isCompletedGroup =
        group.isSuccess === true ||
        String(group.title || "")
          .toLowerCase()
          .includes("done");

      // Duyệt qua từng task trong group
      (group.tasks || []).forEach((task: any) => {
        // 🚀 BỌC THÉP: Nếu task không có ngày, tự động cho là MỚI TẠO HÔM NAY (Giống ông làm ở file cha)
        const rawCreated =
          task.created_at ||
          task.createdAt ||
          task.startDate ||
          task.start_date ||
          new Date().toISOString();
        const rawUpdated = task.updated_at || task.updatedAt || rawCreated;
        const rawDue =
          task.due_date || task.dueDate || task.endDate || task.end_date;

        const createdAt = new Date(rawCreated);
        const updatedAt = new Date(rawUpdated);
        const dueDate = rawDue ? new Date(rawDue) : null;

        // 1. Đếm Task Created (Tạo trong 7 ngày qua)
        if (createdAt >= sevenDaysAgo) createdCount++;

        // 2. Đếm Task Updated (Cập nhật trong 7 ngày qua)
        if (updatedAt >= sevenDaysAgo) updatedCount++;

        // 3. Đếm Task Completed (Hoàn thành trong 7 ngày qua)
        if (isCompletedGroup && updatedAt >= sevenDaysAgo) completedCount++;

        // 4. Đếm Task Due Soon (Chưa xong & Hạn chót trong 3 ngày tới)
        if (
          !isCompletedGroup &&
          dueDate &&
          dueDate >= now &&
          dueDate <= threeDaysFromNow
        ) {
          dueSoonCount++;
        }
      });
    });

    return { completedCount, updatedCount, createdCount, dueSoonCount };
  }, [groups]);

  const statsData = [
    {
      label: "Task Complete",
      quantity: String(stats.completedCount),
      time: "in the last 7 days",
      color: "bg-green-500",
      icon: Check,
    },
    {
      label: "Task Updated",
      quantity: String(stats.updatedCount),
      time: "in the last 7 days",
      color: "bg-orange-500",
      icon: FileEdit,
    },
    {
      label: "Task Created",
      quantity: String(stats.createdCount),
      time: "in the last 7 days",
      color: "bg-cyan-500",
      icon: Layers,
    },
    {
      label: "Task Due Soon",
      quantity: String(stats.dueSoonCount),
      time: "in the next 3 days",
      color: "bg-red-500",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <QuickStaticCard
            key={index}
            label={stat.label}
            quantity={stat.quantity}
            time={stat.time}
            color={stat.color}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickStatisticCardList;
