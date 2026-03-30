import React from "react";
import { TerminalSquare, Network, Megaphone } from "lucide-react";

// --- COMPONENT: RecentProjectItem ---
interface RecentProjectItemProps {
  title: string;
  tasks: number;
  members: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const RecentProjectItem: React.FC<RecentProjectItemProps> = ({
  title,
  tasks,
  members,
  icon,
  iconBgColor,
  iconColor,
}) => {
  return (
    <div className="flex flex-col p-5 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow cursor-pointer">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${iconBgColor} ${iconColor}`}
      >
        {icon}
      </div>
      <h3 className="text-[17px] font-semibold text-gray-800 mb-1.5">
        {title}
      </h3>
      <p className="text-[13px] text-gray-500 font-medium">
        {tasks} Tasks <span className="mx-1">•</span> {members} Members
      </p>
    </div>
  );
};

export default RecentProjectItem;
