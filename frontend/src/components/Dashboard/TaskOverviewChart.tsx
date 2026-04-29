import React from "react";

interface TaskData {
  period: string;
  tasks: number;
}

interface TaskOverviewChartProps {
  data?: TaskData[]; // Thêm dấu ? để chấp nhận cả trường hợp data bị undefined
}

export default function TaskOverviewChart({
  data = [],
}: TaskOverviewChartProps) {
  // 1. Xử lý trường hợp data rỗng hoặc không hợp lệ để tránh crash khi reload
  const hasData = data && data.length > 0;

  // Đảm bảo luôn có ít nhất 12 cột (theo tháng) để giao diện không bị co rúm
  const chartData = hasData
    ? data
    : Array(12)
        .fill(0)
        .map((_, i) => ({
          period: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sept",
            "Oct",
            "Nov",
            "Dec",
          ][i],
          tasks: 0,
        }));

  // 2. Tính toán trục Y - Ép kiểu Number để tránh lỗi nếu API trả về string
  const maxTasks = Math.max(...chartData.map((d) => Number(d.tasks) || 0), 4);
  const step = Math.ceil(maxTasks / 4);
  const maxAxis = step * 4;

  const yAxisLabels = [maxAxis, step * 3, step * 2, step, 0];
  const dotsPerColumn = 8;
  const tasksPerDot = maxAxis / dotsPerColumn || 1; // Tránh chia cho 0

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex-2/3 w-full max-w-2xl min-h-[340px]">
      <h3 className="text-lg font-bold text-gray-800 mb-8">Tasks Overview</h3>

      <div className="flex h-64">
        {/* Trục Y */}
        <div className="flex flex-col justify-between items-end pr-4 text-gray-400 text-sm font-medium w-10">
          {yAxisLabels.map((label, i) => (
            <span key={i}>
              {label >= 1000 ? `${(label / 1000).toFixed(1)}K` : label}
            </span>
          ))}
        </div>

        {/* Khu vực biểu đồ */}
        <div className="flex flex-1 gap-2 min-w-0 items-end border-b border-gray-100 pb-2 overflow-x-hidden">
          {chartData.map((item, index) => {
            const taskCount = Number(item.tasks) || 0;
            const activeDots = Math.ceil(taskCount / tasksPerDot);

            // Tính toán độ đậm nhạt của chấm
            const opacity =
              taskCount === 0 ? 0.1 : Math.max(0.3, taskCount / maxAxis);

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 min-w-[30px]"
              >
                {/* Cột chứa các chấm tròn */}
                <div className="flex flex-col-reverse gap-1.5 h-full justify-start mb-1">
                  {/* Vẽ tối đa 8 chấm tròn dựa trên dotsPerColumn */}
                  {Array.from({ length: dotsPerColumn }).map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${
                        dotIndex < activeDots ? "bg-emerald-400" : "bg-gray-50"
                      }`}
                      style={{
                        opacity: dotIndex < activeDots ? opacity : 1,
                      }}
                    />
                  ))}
                </div>
                {/* Nhãn tháng phía dưới */}
                <span className="text-gray-400 text-[10px] md:text-xs mt-2 font-medium">
                  {item.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thông báo nếu đang load hoặc rỗng */}
      {!hasData && (
        <div className="text-center mt-2">
          <p className="text-gray-300 text-xs italic">Waiting for data...</p>
        </div>
      )}
    </div>
  );
}
