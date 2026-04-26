import React from "react";

interface TaskData {
  period: string;
  tasks: number;
}

interface TaskOverviewChartProps {
  data: TaskData[];
}

export default function TaskOverviewChart({ data }: TaskOverviewChartProps) {
  // Tìm tháng có nhiều task nhất, ít nhất là 4 để chia trục cho đẹp (không bị lỗi chia 0)
  const maxTasks = Math.max(...data.map((d) => d.tasks), 4);
  const step = Math.ceil(maxTasks / 4);
  const maxAxis = step * 4; // Trục Y cao nhất

  // Tự động tạo nhãn trục Y
  const yAxisLabels = [maxAxis, step * 3, step * 2, step, 0];

  const dotsPerColumn = 8;
  const tasksPerDot = maxAxis / dotsPerColumn;

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex-2/3 w-full max-w-2xl">
      <h3 className="text-lg font-bold text-gray-800 mb-8">Tasks Overview</h3>

      <div className="flex h-64">
        <div className="flex flex-col justify-between items-end pr-4 text-gray-400 text-sm font-medium">
          {yAxisLabels.map((label, i) => (
            <span key={i}>
              {label > 1000 ? `${(label / 1000).toFixed(1)}K` : label}
            </span>
          ))}
        </div>

        <div className="flex flex-1 gap-2 min-w-0 items-end border-b overflow-x-auto border-gray-100 pb-2">
          {data.map((item, index) => {
            const activeDots = Math.ceil(item.tasks / tasksPerDot);
            const opacity =
              item.tasks === 0 ? 0 : Math.max(0.3, item.tasks / maxAxis);

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
                <span className="text-gray-400 text-xs mt-2">
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
