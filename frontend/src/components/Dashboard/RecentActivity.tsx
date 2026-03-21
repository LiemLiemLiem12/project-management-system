"use client";

import React, { useState } from "react";

// Dữ liệu mẫu (Mock Data)
const activities = [
  {
    id: 1,
    user: "Trần Thanh Liêm",
    avatar: "TL",
    action: 'updated at field "status" on',
    task: "DC-24: UI Dashboard View",
    status: "DONE",
    time: "2 days ago",
    date: "Saturday, January 31, 2026",
  },
  {
    id: 2,
    user: "Trần Thanh Liêm",
    avatar: "TL",
    action: 'updated at field "status" on',
    task: "DC-24: UI Dashboard View",
    status: "DONE",
    time: "2 days ago",
    date: "Saturday, January 31, 2026",
  },
  {
    id: 3,
    user: "Trần Thanh Liêm",
    avatar: "TL",
    action: 'updated at field "status" on',
    task: "DC-24: UI Dashboard View",
    status: "DONE",
    time: "2 days ago",
    date: "Saturday, January 31, 2026",
  },
];

export default function RecentActivity() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ActivityItem = ({ data }: { data: (typeof activities)[0] }) => (
    <div className="flex flex-2/3 items-start gap-4 mb-6">
      <div className="flex-shrink-0 w-10 h-10 bg-[#0052CC] text-white rounded-full flex items-center justify-center font-bold text-md">
        {data.avatar}
      </div>
      <div>
        <p className="text-md text-gray-800">
          <span className="text-[#0052CC] font-medium cursor-pointer hover:underline">
            {data.user}
          </span>{" "}
          {data.action}{" "}
          <span className="inline-flex items-center gap-1 text-[#0052CC] font-medium cursor-pointer hover:underline">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {data.task}
          </span>{" "}
          <span className="inline-block bg-[#00C853] text-black font-semibold px-1.5 py-0.5 ml-1 text-sm rounded-sm">
            {data.status}
          </span>
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{data.time}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* --- WIDGET CHÍNH --- */}
      <div className="max-w-3xl border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-black">Recent Activity</h2>
            <p className="text-sm text-gray-600">
              Stay up to date with what’s happening across the space
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Mở rộng"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>

        <div>
          <h3 className="text-md font-bold text-black mb-4">
            Saturday, January 31, 2026
          </h3>
          {activities.map((item) => (
            <ActivityItem key={`card-${item.id}`} data={item} />
          ))}
        </div>
      </div>

      {/* --- MODAL HIỂN THỊ TẤT CẢ --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col m-4 z-20">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-black">
                  All Recent Activity
                </h2>
                <p className="text-sm text-gray-600">
                  Detailed view of everything happening in the space
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {/* Icon đóng (Close) */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
              <h3 className="text-md font-bold text-black mb-4">
                Saturday, January 31, 2026
              </h3>
              {activities.map((item) => (
                <ActivityItem key={`modal-1-${item.id}`} data={item} />
              ))}

              <h3 className="text-md font-bold text-black mb-4 mt-8">
                Friday, January 30, 2026
              </h3>
              {activities.map((item) => (
                <ActivityItem key={`modal-2-${item.id}`} data={item} />
              ))}

              <h3 className="text-md font-bold text-black mb-4 mt-8">
                Thursday, January 29, 2026
              </h3>
              {activities.map((item) => (
                <ActivityItem key={`modal-3-${item.id}`} data={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
