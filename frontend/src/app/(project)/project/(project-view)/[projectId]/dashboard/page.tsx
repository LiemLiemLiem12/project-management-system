"use client";

import { useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTaskStore } from "@/store/task.store";
import { useAPI } from "@/API/useAPI";
import CalendarWidget from "@/components/Dashboard/CalendarWidget";
import FilterButton from "@/components/Dashboard/FilterButton";
import ProjectStatusProgressBar from "@/components/Dashboard/ProjectStatusProgressBar";
import QuickStatisticCardList from "@/components/Dashboard/QuickStatisticCardList";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import TableTalentMember from "@/components/Dashboard/TableTalentMember";
import TaskOverviewChart from "@/components/Dashboard/TaskOverviewChart";
import { useGetKanbanBoard } from "@/services/task.service";

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
  const projectId = params.projectId as string;
  const { task } = useAPI();
  useGetKanbanBoard(projectId);

  const groups = useTaskStore((s) => s.groups);
  const setGroups = useTaskStore((s) => s.setGroups);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      try {
        const response = await task.getBoard(projectId);
        if (response && response.data) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [projectId, setGroups, task]);

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

    const completedTasks = groups
      .filter((g) => g.isSuccess)
      .flatMap((g) => g.tasks);

    completedTasks.forEach((t) => {
      const dateStr =
        (t as any).updated_at ||
        (t as any).created_at ||
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
        {/* <div className="flex w-full justify-end">
          <FilterButton />
        </div> */}
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
