"use client";

import { useTaskStore } from "@/store/task.store";

export default function MyTasks() {
  // 👉 Lấy mảng myTasks từ store (đã được useGetMyTasks nạp data vào)
  // Thêm fallback [] để đề phòng lúc data chưa tải xong nó bị undefined
  const myTasks = useTaskStore((s) => s.myTasks) || [];

  // Lọc các task chưa hoàn thành (dựa vào cờ isSuccess từ Backend trả về)
  const openTasks = myTasks.filter((t) => !t.isSuccess);

  // Hiển thị tối đa 5 task cho gọn Dashboard
  const displayedTasks = myTasks.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">My Tasks</h2>
        <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
          {openTasks.length} OPEN
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {myTasks.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            Hooray! You have no tasks assigned.
          </p>
        ) : (
          displayedTasks.map((t) => (
            <div
              key={t.id}
              className="py-3 flex flex-col gap-1.5 hover:bg-gray-50 transition-colors rounded-md px-1 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-sm font-medium ${t.isSuccess ? "text-gray-400 line-through" : "text-gray-800"}`}
                >
                  {t.title}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                  {t.groupTitle || "No Group"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>ID: {t.id}</span>
                {t.due_date && (
                  <span
                    className={
                      new Date(t.due_date) < new Date() && !t.isSuccess
                        ? "text-red-500"
                        : ""
                    }
                  >
                    Due: {new Date(t.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {myTasks.length > 5 && (
        <button className="w-full mt-4 py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all duration-150">
          VIEW ALL {myTasks.length} TASKS
        </button>
      )}
    </div>
  );
}
