"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoleDropdown from "./RoleDropdown";
import { useGetProjectMembers } from "@/services/project.service";
import { useTaskStore } from "@/store/task.store";

interface TableTalentMemberProps {
  projectId: string;
}

export default function TableTalentMember({
  projectId,
}: TableTalentMemberProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy dữ liệu thật từ API và Store
  const { data: membersData } = useGetProjectMembers(projectId);
  const groups = useTaskStore((s) => s.groups);

  // Ép kiểu dữ liệu members để lấy được trường role
  const projectMembers = (membersData as any[]) || [];

  // Tính toán % tiến độ dựa trên Task assigned
  const memberStats = useMemo(() => {
    return projectMembers.map((member) => {
      let totalAssigned = 0;
      let totalCompleted = 0;

      groups.forEach((group) => {
        group.tasks.forEach((task) => {
          // So khớp ID người được giao với ID thành viên
          if (task.assignee_id === member.user_id) {
            totalAssigned += 1;
            // Nếu group được đánh dấu là Success (thường là cột Done) thì tính là hoàn thành
            if (group.isSuccess) {
              totalCompleted += 1;
            }
          }
        });
      });

      const progress =
        totalAssigned === 0
          ? 0
          : Math.round((totalCompleted / totalAssigned) * 100);

      return {
        ...member,
        progress,
        avatarInitial: member.full_name
          ? member.full_name.charAt(0).toUpperCase()
          : member.user_id?.charAt(0).toUpperCase() || "?",
      };
    });
  }, [projectMembers, groups]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Project Members</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-200">
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
            <tr className="border-y border-gray-100 bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Task Progression
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {memberStats.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-gray-400 italic"
                >
                  No members found in this project.
                </td>
              </tr>
            ) : (
              memberStats.map((member) => (
                <tr
                  key={member.user_id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Cột Member */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          member.avatarInitial
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {member.full_name || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-400 truncate max-w-[150px]">
                          {member.email || member.user_id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cột Role - Hiển thị giá trị thật từ DB */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                      {member.role || "MEMBER"}
                    </span>
                  </td>

                  {/* Cột Task Progression */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-end w-full ml-auto max-w-[180px]">
                      <span className="text-xs text-gray-600 font-bold mb-1.5">
                        {member.progress}%
                      </span>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            member.progress === 100
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
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
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-100 bg-gray-50/30">
          <div className="text-sm text-gray-500 mb-4 sm:mb-0 font-medium">
            Showing <span className="text-gray-900 font-bold">1</span> to{" "}
            <span className="text-gray-900 font-bold">
              {memberStats.length}
            </span>{" "}
            of{" "}
            <span className="text-gray-900 font-bold">
              {memberStats.length}
            </span>{" "}
            members
          </div>

          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all text-gray-400 hover:text-gray-600 disabled:opacity-30"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-200 text-xs font-bold">
              1
            </button>
            <button
              className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all text-gray-400 hover:text-gray-600 disabled:opacity-30"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
