"use client";

import { useGetMyTasks } from "@/services/task.service";
import WelcomeHeader from "@/components/Dashboard/WelcomeHeader";
import FrequentlyVisited from "@/components/Dashboard/FrequentlyVisited";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import MyTasks from "@/components/Dashboard/MyTasks";

export default function DashboardPage() {
  const { isLoading, isError } = useGetMyTasks();

  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center bg-gray-50 text-gray-500">
        <span className="animate-pulse">Loading workspace data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex justify-center items-center bg-gray-50 text-red-500">
        Oops! Something went wrong while loading data.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            <WelcomeHeader />
            <FrequentlyVisited />
            <ActivityFeed />
          </div>

          <aside className="w-full lg:w-80 flex-none flex flex-col gap-6 order-first lg:order-last">
            <MyTasks />
          </aside>
        </div>
      </div>
    </div>
  );
}
