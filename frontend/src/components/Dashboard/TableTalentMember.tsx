"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoleDropdown from "./RoleDropdown";
import LabelMemberChoice from "./LabelMemberChoice";
import { useGetProjectMembers } from "@/services/project.service";
import { useTaskStore } from "@/store/task.store";

interface TableTalentMemberProps {
  projectId: string;
}

export default function TableTalentMember({
  projectId,
}: TableTalentMemberProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy dữ liệu thật từ Store và API
  const { data: membersData } = useGetProjectMembers(projectId);
  const groups = useTaskStore((s) => s.groups);
  const projectMembers = (membersData as any[]) || [];

  // Tính toán % tiến độ cho từng Member
  const memberStats = useMemo(() => {
    return projectMembers.map((member) => {
      let totalAssigned = 0;
      let totalCompleted = 0;

      groups.forEach((group) => {
        group.tasks.forEach((task) => {
          // CHỈ GIỮ LẠI CHECK assignee_id THÔI NÈ
          if (task.assignee_id === member.user_id) {
            totalAssigned += 1;
            if (group.isSuccess) {
              totalCompleted += 1;
            }
          }
        });
      });

      const progress = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100);

      return {
        ...member,
        progress,
        avatarInitial: member.full_name ? member.full_name.charAt(0).toUpperCase() : member.user_id.charAt(0).toUpperCase(),
      };
    });
  }, [projectMembers, groups]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">All Members</h2>
          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md">
            {memberStats.length}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <RoleDropdown />
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
              {/* ĐÃ ẨN CỘT ACTIONS */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {memberStats.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                  No members found in this project.
                </td>
              </tr>
            ) : (
              memberStats.map((member) => (
                <tr
                  key={member.user_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Cột Member */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                        {member.avatarInitial}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base">
                          {member.full_name || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {member.role || "Member"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột Label/Role */}
                  <td className="py-4 px-6 min-w-10 max-w-100 w-1/4">
                    <LabelMemberChoice />
                  </td>

                  {/* Cột Task Progression */}
                  <td className="py-4 px-6 w-1/4">
                    <div className="flex flex-col w-full max-w-[200px]">
                      <span className="text-xs text-gray-700 font-medium self-end mb-1">
                        {member.progress}%
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${member.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {memberStats.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0 font-medium">
            Showing <span className="font-bold">1</span> to{" "}
            <span className="font-bold">{memberStats.length}</span> of{" "}
            <span className="font-bold">{memberStats.length}</span> results
          </div>

          <div className="flex items-center gap-1 text-gray-600 font-medium text-sm">
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className={`w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white`}
            >
              1
            </button>
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
