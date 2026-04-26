"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTaskStore } from "@/store/task.store";
import CalendarWidget from "@/components/Dashboard/CalendarWidget";
import FilterButton from "@/components/Dashboard/FilterButton";
import ProjectStatusProgressBar from "@/components/Dashboard/ProjectStatusProgressBar";
import QuickStatisticCardList from "@/components/Dashboard/QuickStatisticCardList";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import TableTalentMember from "@/components/Dashboard/TableTalentMember";
import TaskOverviewChart from "@/components/Dashboard/TaskOverviewChart";

// Bảng màu tự động cho các Group Task
const GROUP_COLORS = [
  "bg-blue-500",
  "bg-orange-400",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export default function DashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string; // Lấy ID dự án từ URL

  const groups = useTaskStore((s) => s.groups);

  // 1. Tính toán Project Status (% của mỗi group)
  const projectStatusData = useMemo(() => {
    const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0);

    return groups.map((g, index) => {
      const percentage =
        totalTasks === 0 ? 0 : Math.round((g.tasks.length / totalTasks) * 100);
      return {
        name: g.title,
        percentage: percentage,
        colorClass: GROUP_COLORS[index % GROUP_COLORS.length],
      };
    });
  }, [groups]);

  // 2. Tính toán Task Overview (Task hoàn thành theo tháng)
  const taskData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = monthNames.map((month) => ({
      period: month,
      tasks: 0,
    }));

    // Lấy tất cả các task nằm trong cột đã hoàn thành (isSuccess = true)
    const completedTasks = groups
      .filter((g) => g.isSuccess)
      .flatMap((g) => g.tasks);

    completedTasks.forEach((task) => {
      // Ưu tiên dùng updated_at (ngày hoàn thành), nếu không có thì dùng created_at hoặc ngày hiện tại
      const dateStr =
        (task as any).updated_at ||
        (task as any).created_at ||
        new Date().toISOString();
      const monthIndex = new Date(dateStr).getMonth();
      if (monthIndex >= 0 && monthIndex <= 11) {
        monthlyData[monthIndex].tasks += 1;
      }
    });

    return monthlyData;
  }, [groups]);

  return (
    <>
      <div className="h-full w-full p-10 overflow-y-auto font-sans">
        <div className="flex w-full justify-end">
          <FilterButton />
        </div>
        <QuickStatisticCardList />
        <div className="flex flex-col w-full lg:flex-row gap-3 mt-3">
          <TaskOverviewChart data={taskData} />
          <ProjectStatusProgressBar data={projectStatusData} />
        </div>
        <div className="flex flex-col w-full lg:flex-row gap-3 mt-3">
          <RecentActivity />
          <CalendarWidget />
        </div>
        <div className="mt-3">
          <TableTalentMember projectId={projectId} />
        </div>
      </div>
    </>
  );
}
