import React, { useMemo, useState } from "react";
import { Check, Link2, X } from "lucide-react";
import { Asset, User } from "@/types";
import { useGetUsersById } from "@/services/user.service";
import { AssetPermissionEnum } from "@/enums/asset-permission.enum";
import { useSyncUserPermission } from "@/services/storage.service";
import { useProjectStore } from "@/store/project.store";
import toast from "react-hot-toast";
import { useGetProjectMembers } from "@/services/project.service";
import { ProjectMember } from "@/API/project.api";
import Image from "next/image";

// --- Định nghĩa kiểu dữ liệu ---
interface PermissionGrantModalProps {
  file: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionGrantModal({
  file,
  isOpen,
  onClose,
}: PermissionGrantModalProps) {
  const currentProject = useProjectStore((s) => s.currentProject);
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- 1. LẤY RAW IDs TỪ FILE VÀ PROJECT ---
  const fileUserIds = useMemo(() => {
    if (!file?.permissions) return [];
    return Array.from(new Set(file.permissions.map((p) => p.userId)));
  }, [file?.permissions]);

  const { data: projectMembers = [] } = useGetProjectMembers(
    currentProject?.id || "",
  );

  // --- 2. GỘP TẤT CẢ IDs LẠI VÀ FETCH 1 LẦN ---
  const allUserIdsToFetch = useMemo(() => {
    const projectMemberIds = projectMembers.map(
      (m: ProjectMember) => m.user_id,
    );
    // Dùng Set để loại bỏ ID trùng lặp giữa 2 danh sách
    return Array.from(new Set([...fileUserIds, ...projectMemberIds]));
  }, [fileUserIds, projectMembers]);

  const { data: allUsers = [], isPending: pendingUsers } =
    useGetUsersById(allUserIdsToFetch);

  // --- 3. PHÂN LOẠI USERS (CÓ QUYỀN vs CHƯA CÓ QUYỀN) ---

  const grantedUsers = useMemo(() => {
    const filteredUsers = allUsers.filter((user: User) =>
      fileUserIds.includes(user?.id),
    );

    return filteredUsers.sort((a, b) => {
      const nameA = a.fullName || "";
      const nameB = b.fullName || "";
      return nameA.localeCompare(nameB);
    });
  }, [allUsers, fileUserIds]);

  const ungrantedUsers = useMemo(() => {
    const projectMemberIds = projectMembers.map(
      (m: ProjectMember) => m.user_id,
    );
    return allUsers.filter(
      (user: User) =>
        projectMemberIds.includes(user?.id) && // Là thành viên project
        !fileUserIds.includes(user?.id) && // Chưa được gán quyền
        user?.id !== file?.uploadedBy, // Không phải là chủ sở hữu file
    );
  }, [allUsers, projectMembers, fileUserIds, file]);

  const filteredSearchMembers = useMemo(() => {
    if (!searchTerm.trim()) return ungrantedUsers;
    const lower = searchTerm.toLowerCase();
    return ungrantedUsers.filter(
      (m: User) =>
        m.fullName?.toLowerCase().includes(lower) ||
        m.email?.toLowerCase().includes(lower),
    );
  }, [searchTerm, ungrantedUsers]);

  // --- CÁC LOGIC KHÁC GIỮ NGUYÊN ---
  const {
    mutateAsync: syncUserPermission,
    isPending: pendingSyncUserPermission,
  } = useSyncUserPermission();

  const PERMISSION_OPTIONS: AssetPermissionEnum[] = [
    AssetPermissionEnum.READ,
    AssetPermissionEnum.CREATE,
    AssetPermissionEnum.UPDATE,
    AssetPermissionEnum.DELETE,
  ];

  const groupedPermissions = useMemo(() => {
    if (!file?.permissions) return [];
    const groups = file.permissions.reduce(
      (acc, curr) => {
        if (!acc[curr.userId]) {
          acc[curr.userId] = { userId: curr.userId, perms: [] };
        }
        if (!acc[curr.userId].perms.includes(curr.permission)) {
          acc[curr.userId].perms.push(curr.permission);
        }
        return acc;
      },
      {} as Record<string, { userId: string; perms: string[] }>,
    );
    return Object.values(groups);
  }, [file?.permissions]);

  const handleCopyLink = async () => {
    if (!file || !currentProject) return;
    try {
      let link: string = "";
      const hostName = process.env.NEXT_PUBLIC_FRONTEND || "";
      if (file.isFolder) {
        link = `${hostName}/project/${currentProject.id}/storage/folder/${file.id}`;
      } else {
        link = file.storageUrl || "";
      }
      await navigator.clipboard.writeText(link);
      setIsCopy(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopy(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link.");
    }
  };

  const handleTogglePermission = async (userId: string, perm: string) => {
    if (!file) return;

    const group = groupedPermissions.find((g) => g.userId === userId);
    let newPermissions: string[] = [];

    if (group) {
      if (group.perms.includes(perm)) {
        newPermissions = group.perms.filter((p) => p !== perm);
      } else {
        newPermissions = [...group.perms, perm];
      }
    } else {
      newPermissions = [perm];
    }

    setSearchTerm("");
    setIsSearchFocused(false);

    await syncUserPermission({
      fileId: file.id,
      userId: userId,
      newPermissions,
    });
  };

  if (!isOpen || !file) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[22px] text-gray-800 font-normal">
            Share "{file.name}"
          </h2>
        </div>

        {/* --- Body --- */}
        <div className="px-6 py-2 overflow-y-auto flex-1 custom-scrollbar">
          {/* Input Add User */}
          <div className="mt-2 mb-6 relative">
            <div className="relative border border-gray-300 rounded-md px-3 py-3 hover:border-gray-800 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-blue-600 font-medium pointer-events-none">
                Add users in project
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full text-sm outline-none bg-transparent placeholder-gray-500"
                placeholder="Type name or email..."
              />
            </div>

            {/* Dropdown gợi ý */}
            {isSearchFocused && filteredSearchMembers.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto custom-scrollbar overflow-hidden">
                {filteredSearchMembers.map((member: User) => (
                  <div
                    key={member.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleTogglePermission(
                        member.id,
                        AssetPermissionEnum.READ,
                      );
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Không tìm thấy */}
            {isSearchFocused &&
              searchTerm &&
              filteredSearchMembers.length === 0 && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 text-center text-sm text-gray-500">
                  No users found.
                </div>
              )}
          </div>

          {/* User List Đã có quyền */}
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-800 mb-4">
              Permission Users
            </h3>

            {pendingUsers ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Loading users...
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Dùng grantedUsers thay vì users */}
                {grantedUsers.map((user: User) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Image
                      width={40}
                      height={40}
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[13px] text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    {user.id === file.uploadedBy ? (
                      <span className="text-sm text-gray-500 italic pr-2">
                        Owner
                      </span>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                        {PERMISSION_OPTIONS.map((perm) => {
                          const isActive = groupedPermissions.find(
                            (group) =>
                              group.userId === user.id &&
                              group.perms.includes(perm),
                          );

                          return (
                            <button
                              disabled={pendingSyncUserPermission}
                              key={perm}
                              onClick={() =>
                                handleTogglePermission(user.id, perm)
                              }
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors border ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                              } ${pendingSyncUserPermission ? "opacity-50 cursor-not-allowed" : ""}`}
                              title={`Press to ${isActive ? "delete" : "add"} permission ${perm}`}
                            >
                              {perm.charAt(0).toUpperCase() +
                                perm.slice(1).toLowerCase()}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-5 flex items-center justify-between rounded-b-3xl bg-white mt-auto">
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300
              ${isCopy ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-blue-600 hover:bg-blue-50/50"}
            `}
          >
            {isCopy ? (
              <>
                <Check size={18} /> Copied!
              </>
            ) : (
              <>
                <Link2 size={18} /> Copy link
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
