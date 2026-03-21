"use client";

import React, { useState } from "react";
import { Edit, ChevronLeft, ChevronRight } from "lucide-react";
import RoleDropdown from "./RoleDropdown";
import DashboardFilter from "./DashboardFilter";

// Dữ liệu mẫu (Mock data)
const mockMembers = [
  {
    id: 1,
    name: "Bob Smith",
    email: "bob@company.com",
    avatar: "https://i.pravatar.cc/150?img=11", // Hình ảnh giả lập
    roles: [
      { name: "Developer", color: "bg-blue-100 text-blue-600" },
      { name: "Designer", color: "bg-red-100 text-red-600" },
      { name: "More", color: "bg-blue-50 text-blue-500" },
    ],
    progress: 75,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@company.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    roles: [
      { name: "Developer", color: "bg-blue-100 text-blue-600" },
      { name: "Designer", color: "bg-red-100 text-red-600" },
      { name: "More", color: "bg-blue-50 text-blue-500" },
    ],
    progress: 75,
  },
  {
    id: 3,
    name: "Bob Smith",
    email: "bob@company.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    roles: [
      { name: "Developer", color: "bg-blue-100 text-blue-600" },
      { name: "Designer", color: "bg-red-100 text-red-600" },
      { name: "More", color: "bg-blue-50 text-blue-500" },
    ],
    progress: 75,
  },
];

export default function TableTalentMember() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">All Members</h2>
          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md">
            24
          </span>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <RoleDropdown />
          <DashboardFilter />
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y border-gray-200 bg-white">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Task Progression
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockMembers.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Cột Member */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover bg-yellow-400"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-base">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Cột Role */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {member.roles.map((role, index) => (
                      <span
                        key={index}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${role.color}`}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Cột Task Progression */}
                <td className="py-4 px-6 w-1/4">
                  <div className="flex flex-col w-full max-w-[200px]">
                    <span className="text-xs text-gray-700 font-medium self-end mb-1">
                      {member.progress}%
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${member.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Cột Actions */}
                <td className="py-4 px-6">
                  <button className="text-gray-600 hover:text-black transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0 font-medium">
          Showing <span className="font-bold">1</span> to{" "}
          <span className="font-bold">5</span> of{" "}
          <span className="font-bold">25</span> results
        </div>

        <div className="flex items-center gap-1 text-gray-600 font-medium text-sm">
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === 2 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === 3 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <span className="w-8 h-8 flex items-center justify-center">...</span>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === 4 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            onClick={() => setCurrentPage(4)}
          >
            4
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === 5 ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
            onClick={() => setCurrentPage(5)}
          >
            5
          </button>

          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
