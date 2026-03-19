import { Dispatch, SetStateAction, useState } from "react";
import {
  Gauge,
  GitBranch,
  Layout,
  Table,
  Archive,
  Share2,
  MoreHorizontal,
} from "lucide-react";

const ProjectDetailNavbar = () => {
  const [activeTab, setActiveTab]: [string, Dispatch<SetStateAction<string>>] =
    useState("Dashboard");

  const navItems = [
    { name: "Dashboard", icon: <Gauge size={18} /> },
    { name: "Timeline", icon: <GitBranch size={18} /> },
    { name: "Kanban", icon: <Layout size={18} /> },
    { name: "Spreadsheet", icon: <Table size={18} /> },
    { name: "Storage", icon: <Archive size={18} /> },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 pt-4">
      {/* Top Section: Breadcrumb & Title & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Workspace</p>
          <h1 className="text-xl font-bold text-gray-900">Project Name</h1>
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Tabs */}
      <div className="flex items-center space-x-6">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex items-center gap-2 pb-3 text-sm transition-all duration-100 ease-in font-medium transition-all relative
              ${
                activeTab === item.name
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <span
              className={
                activeTab === item.name ? "text-black" : "text-gray-400"
              }
            >
              {item.icon}
            </span>
            {item.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ProjectDetailNavbar;
