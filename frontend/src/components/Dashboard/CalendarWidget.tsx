"use client";

import React, { useState, useMemo } from "react";

const mockTasks = [
  { id: 1, date: "2024-03-15", title: "Hoàn thành UI Dashboard" },
  { id: 2, date: "2024-03-15", title: "Họp team Frontend" },
  { id: 3, date: "2024-03-22", title: "Deploy phiên bản v1.0" },
  { id: 4, date: "2024-04-05", title: "Review code" },
];

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const nowDate = new Date();

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Điền các ngày của tháng trước (Padding)
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        dateObj: new Date(currentYear, currentMonth - 1, day),
      });
    }

    // Điền các ngày của tháng hiện tại
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        dateObj: new Date(currentYear, currentMonth, i),
      });
    }

    // Điền các ngày của tháng tiếp theo (để đủ 5 hoặc 6 dòng - 35 hoặc 42 ô)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        dateObj: new Date(currentYear, currentMonth + 1, i),
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  return (
    <div className="flex-1/3 border border-gray-200 rounded-xl p-6 bg-white shadow-sm font-sans">
      {/* Header: Tháng/Năm và Nút điều hướng */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[22px] font-bold text-black">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center bg-[#3B82F6] hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center bg-[#3B82F6] hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Grid Lịch */}
      <div className="w-full">
        {/* Hàng Tiêu đề (SUN, MON, ...) */}
        <div className="grid grid-cols-7 mb-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-black">
              {day}
            </div>
          ))}
        </div>

        {/* Các Ngày */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, index) => {
            const dateStr = formatDateString(item.dateObj);
            const dayTasks = mockTasks.filter((task) => task.date === dateStr);
            const hasTasks = dayTasks.length > 0;
            const isToday =
              item.dateObj.toDateString() === nowDate.toDateString();

            return (
              <div
                key={index}
                className={`relative ${isToday && `bg-gray-200`} p-2 w-full rounded-lg h-full flex justify-center items-center group cursor-pointer`}
              >
                {/* Số ngày */}
                <span
                  className={`text-[15px] ${item.isCurrentMonth ? "text-gray-800" : "text-gray-400"}`}
                >
                  {String(item.day).padStart(2, "0")}
                </span>

                {/* Dấu chấm đỏ báo hiệu có task */}
                {hasTasks && (
                  <span className="absolute top-[-4px] w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}

                {/* Tooltip khi hover (Chỉ hiện khi có task) */}
                {hasTasks && (
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 w-max min-w-[120px]">
                    <div className="bg-gray-800 text-white text-xs rounded-md py-1.5 px-3 shadow-lg text-center">
                      {dayTasks.map((t) => (
                        <div key={t.id} className="whitespace-nowrap">
                          {t.title}
                        </div>
                      ))}
                    </div>
                    {/* Mũi tên của tooltip */}
                    <div className="w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
