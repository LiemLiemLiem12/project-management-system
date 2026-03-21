import React from "react";

interface GroupData {
  name: string;
  percentage: number; // 0 - 100
  colorClass: string; // Tailwind color class (VD: 'bg-blue-500')
}

interface ProjectStatusProgressBarProps {
  data: GroupData[];
}

export default function ProjectStatusProgressBar({
  data,
}: ProjectStatusProgressBarProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex-1/3 w-full">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Project Status</h3>

      <div className="flex flex-col gap-5">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {item.percentage}%
              </span>
            </div>

            {/* Thanh Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${item.colorClass}`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
