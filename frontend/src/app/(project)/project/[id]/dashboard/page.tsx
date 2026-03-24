import CalendarWidget from "@/components/Dashboard/CalendarWidget";
import FilterButton from "@/components/Dashboard/FilterButton";
import ProjectStatusProgressBar from "@/components/Dashboard/ProjectStatusProgressBar";
import QuickStatisticCardList from "@/components/Dashboard/QuickStatisticCardList";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import TableTalentMember from "@/components/Dashboard/TableTalentMember";
import TaskOverviewChart from "@/components/Dashboard/TaskOverviewChart";

const taskData = [
  { period: "Jan", tasks: 35000 },
  { period: "Feb", tasks: 10000 },
  { period: "Mar", tasks: 20000 },
  { period: "Apr", tasks: 15000 },
  { period: "May", tasks: 30000 },
  { period: "June", tasks: 25000 },
  { period: "July", tasks: 38000 },
  { period: "Aug", tasks: 20000 },
  { period: "Sept", tasks: 15000 },
  { period: "Oct", tasks: 20000 },
  { period: "Nov", tasks: 20000 },
  { period: "Dec", tasks: 25000 },
];

const projectStatusData = [
  { name: "To Do", percentage: 50, colorClass: "bg-blue-500" },
  { name: "In Progress", percentage: 10, colorClass: "bg-orange-400" },
  { name: "Done", percentage: 20, colorClass: "bg-green-500" },
  { name: "Prepare", percentage: 20, colorClass: "bg-purple-500" },
];

export default function DashboardPage() {
  return (
    <>
      <div className="h-full w-full">
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
          <TableTalentMember />
        </div>
      </div>
    </>
  );
}
