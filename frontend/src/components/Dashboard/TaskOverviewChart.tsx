import React from "react";

interface TaskData {
  period: string;
  tasks: number;
}

interface TaskOverviewChartProps {
  data: TaskData[];
}

export default function TaskOverviewChart({ data }: TaskOverviewChartProps) {
  const maxTasks = Math.max(...data.map((d) => d.tasks));

  const dotsPerColumn = 8;
  const tasksPerDot = maxTasks / dotsPerColumn;

  const yAxisLabels = [40, 30, 20, 10, 0];

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex-2/3 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-8">Tasks Overview</h3>

      <div className="flex h-64">
        <div className="flex flex-col justify-between items-end pr-4 text-gray-400 text-sm font-medium">
          {yAxisLabels.map((label) => (
            <span key={label}>{label}K</span>
          ))}
        </div>

        <div className="flex flex-1 gap-2 min-w-0 items-end border-b overflow-x-auto border-gray-100 pb-2">
          {data.map((item, index) => {
            const activeDots = Math.ceil(item.tasks / tasksPerDot);

            const opacity = Math.max(0.2, item.tasks / maxTasks);

            return (
              <div key={index} className="flex flex-col items-center w-full">
                <div className="flex flex-col-reverse gap-1.5 h-full justify-start">
                  {Array.from({ length: activeDots }).map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className="w-4 h-4 rounded-full bg-emerald-400"
                      style={{ opacity: opacity }}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm mt-2">
                  {item.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
