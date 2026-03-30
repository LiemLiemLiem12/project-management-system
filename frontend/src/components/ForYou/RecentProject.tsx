import { Megaphone, Network, TerminalSquare } from "lucide-react";
import RecentProjectItem from "./RecentProjectItem";

// --- COMPONENT: RecentProject ---
const mockProjects = [
  {
    id: "1",
    title: "Dự án CNTT",
    tasks: 12,
    members: 4,
    icon: <TerminalSquare size={22} strokeWidth={2.5} />,
    iconBgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "2",
    title: "Project Mgmt",
    tasks: 8,
    members: 2,
    icon: <Network size={22} strokeWidth={2.5} />,
    iconBgColor: "bg-purple-50",
    iconColor: "text-purple-700",
  },
  {
    id: "3",
    title: "Branding Flow",
    tasks: 15,
    members: 6,
    icon: <Megaphone size={22} strokeWidth={2.5} />,
    iconBgColor: "bg-slate-50",
    iconColor: "text-slate-700",
  },
];

export default function RecentProject() {
  return (
    <div className="w-full max-w-5xl  bg-[#f8fafc]">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[13px] font-bold text-gray-500 tracking-wider uppercase">
          Recent Spaces
        </h2>
        <button className="text-[13px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
          View All
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {mockProjects.map((project) => (
          <RecentProjectItem
            key={project.id}
            title={project.title}
            tasks={project.tasks}
            members={project.members}
            icon={project.icon}
            iconBgColor={project.iconBgColor}
            iconColor={project.iconColor}
          />
        ))}
      </div>
    </div>
  );
}
