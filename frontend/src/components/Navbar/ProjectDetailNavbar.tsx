"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Gauge,
  GitBranch,
  Layout,
  Table,
  Archive,
  Share2,
  UserPlus,
  ChevronDown,
  Plus,
  UserMinus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProjectStore } from "@/store/project.store";
import { useAuthStore } from "@/store/auth.store"; // 🚀 IMPORT STORE CỦA ÔNG VÀO ĐÂY
import {
  useGetProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  useUpdateMemberRole,
} from "@/services/project.service";

const ProjectMembersDropdown = ({ projectId }: { projectId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [kickConfirmUserId, setKickConfirmUserId] = useState<string | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  // 🚀 LẤY USER TỪ ZUSTAND STORE CỦA ÔNG
  const currentUser = useAuthStore((s: any) => s.user);
  // Đề phòng backend trả về tên field là id, user_id, hay _id
  const myUserId =
    currentUser?.id || currentUser?.user_id || currentUser?._id || "";

  const { data: membersData } = useGetProjectMembers(projectId);
  const members = (membersData as any[]) || [];

  const { mutate: addMember, isPending: isAdding } =
    useAddProjectMember(projectId);
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveProjectMember(projectId);
  const { mutate: updateRole, isPending: isUpdating } =
    useUpdateMemberRole(projectId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kickConfirmUserId) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [kickConfirmUserId]);

  const handleAddMember = () => {
    if (!email.trim() || isAdding) return;
    addMember({ email: email.trim(), role: role.toUpperCase() } as any, {
      onSuccess: () => setEmail(""),
    });
  };

  const handleKickClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setTimeout(() => {
      setKickConfirmUserId(userId);
    }, 50);
  };

  const executeKick = () => {
    if (kickConfirmUserId) {
      removeMember(kickConfirmUserId, {
        onSuccess: () => setKickConfirmUserId(null),
      });
    }
  };

  const handleRoleChange = (
    userId: string,
    newRole: string,
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.stopPropagation();
    updateRole({ userId, payload: { role: newRole.toUpperCase() } });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center -space-x-2.5 outline-none hover:scale-105 transition-transform"
      >
        {members.slice(0, 3).map((member, idx) => (
          <div
            key={member.user_id}
            className="w-8 h-8 rounded-full border-[2px] border-white bg-[#5b81f8] text-white flex items-center justify-center text-xs font-bold shadow-sm relative"
            style={{ zIndex: 10 - idx }}
          >
            {member.full_name ? member.full_name.charAt(0).toUpperCase() : "U"}
          </div>
        ))}
        {members.length > 3 && (
          <div
            className="w-8 h-8 rounded-full border-[2px] border-white bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shadow-sm relative"
            style={{ zIndex: 5 }}
          >
            +{members.length - 3}
          </div>
        )}
        <div
          className="w-8 h-8 rounded-full border-[2px] border-white bg-gray-50 text-gray-400 flex items-center justify-center shadow-sm relative border-dashed hover:bg-gray-100 transition-colors"
          style={{ zIndex: 0 }}
        >
          <Plus size={14} strokeWidth={3} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+12px)] w-[540px] bg-white border border-gray-200 rounded-xl shadow-2xl z-40 p-6 cursor-default">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-[#1e293b]">Add members</h2>
          </div>
          <hr className="border-gray-100 mb-6" />

          <div className="flex gap-3 mb-8">
            <input
              type="email"
              placeholder="name@company.com"
              disabled={isAdding}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
            <div className="relative w-36">
              <select
                disabled={isAdding}
                className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 cursor-pointer text-gray-700"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Leader">Leader</option>
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
            <button
              onClick={handleAddMember}
              disabled={isAdding}
              className="bg-[#93C5FD] hover:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {isAdding ? "Adding" : "Add"}
            </button>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-[#475569] mb-3">
              Team members ({members.length})
            </h3>
            <div className="max-h-[220px] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
              {members.map((member) => {
                // 🚀 NÓ SO SÁNH ID Ở ĐÂY NÈ ÔNG
                const isMe = member.user_id === myUserId;

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5b81f8] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {member.full_name
                          ? member.full_name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {member.full_name || "Unknown"} {isMe && " (You)"}
                        </span>
                        <span className="text-[12px] text-gray-500">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMe ? (
                        <span className="text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1.5 rounded-md uppercase tracking-wide">
                          {member.role || "MEMBER"}
                        </span>
                      ) : (
                        <>
                          <select
                            disabled={isUpdating || isRemoving}
                            value={member.role?.toUpperCase() || "MEMBER"}
                            onChange={(e) =>
                              handleRoleChange(
                                member.user_id,
                                e.target.value,
                                e,
                              )
                            }
                            className="text-xs font-medium text-gray-600 bg-gray-100 border-none rounded-md px-2 py-1.5 cursor-pointer outline-none disabled:opacity-50"
                          >
                            <option value="LEADER">Leader</option>
                            <option value="MEMBER">Member</option>
                            <option value="MODERATOR">Moderator</option>
                          </select>
                          <button
                            onClick={(e) => handleKickClick(member.user_id, e)}
                            disabled={isRemoving || isUpdating}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                          >
                            <UserMinus size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL NẰM NGOÀI CÙNG DOM */}
      {mounted &&
        kickConfirmUserId &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Remove Member?
              </h3>
              <p className="text-sm text-gray-500 mb-8 px-4">
                Are you sure you want to remove this member from the project?
                They will lose access to all tasks and files.
              </p>
              <div className="flex gap-3 justify-center w-full">
                <button
                  onClick={() => setKickConfirmUserId(null)}
                  disabled={isRemoving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeKick}
                  disabled={isRemoving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isRemoving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {isRemoving ? "Removing..." : "Yes, Remove"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const ProjectDetailNavbar = () => {
  const { projectId } = useParams() || "";
  const pathname = usePathname();

  const currentProject = useProjectStore((s: any) => s.currentProject);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems = [
    {
      name: "Dashboard",
      icon: <Gauge size={18} />,
      link: `/project/${projectId}/dashboard`,
    },
    {
      name: "Timeline",
      icon: <GitBranch size={18} />,
      link: `/project/${projectId}/timeline`,
    },
    {
      name: "Kanban",
      icon: <Layout size={18} />,
      link: `/project/${projectId}/kanban`,
    },
    {
      name: "Spreadsheet",
      icon: <Table size={18} />,
      link: `/project/${projectId}/spreadsheet`,
    },
    {
      name: "Storage",
      icon: <Archive size={18} />,
      link: `/project/${projectId}/storage`,
    },
  ];

  useEffect(() => {
    const currentItem = navItems.find((item) => pathname.includes(item.link));
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [pathname, projectId]);

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 pt-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Workspace</p>

          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              {currentProject?.name || "Loading project..."}
            </h1>

            {projectId && (
              <ProjectMembersDropdown projectId={projectId as string} />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-6 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            href={item.link}
            key={item.name}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all relative
              ${
                activeTab === item.name
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <span
              className={
                activeTab === item.name ? "text-black" : "text-gray-400"
              }
            >
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default ProjectDetailNavbar;
