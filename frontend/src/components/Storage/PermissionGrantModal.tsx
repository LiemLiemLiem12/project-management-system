import React, { useMemo, useState } from "react";
import { Link2, X } from "lucide-react";
import { Asset, User } from "@/types";
import { useGetUsersById } from "@/services/user.service";
import { AssetPermissionEnum } from "@/enums/asset-permission.enum";

// --- Định nghĩa kiểu dữ liệu ---
interface Permissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

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
  if (!isOpen || !file) return null;

  const userIds = useMemo(() => {
    if (!file.permissions) return [];
    return Array.from(new Set(file.permissions.map((p) => p.userId)));
  }, [file.permissions]);

  const { data: users, isPending: pendingUser } = useGetUsersById(userIds);
  const PERMISSION_OPTIONS: AssetPermissionEnum[] = [
    AssetPermissionEnum.CREATE,
    AssetPermissionEnum.DELETE,
    AssetPermissionEnum.READ,
    AssetPermissionEnum.DELETE,
  ];

  const groupedPermissions = useMemo(() => {
    if (!file.permissions) return [];

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
  }, [file.permissions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-[560px] bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* --- Header --- */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[22px] text-gray-800 font-normal">
            Share "{file.name}"
          </h2>
        </div>

        {/* --- Body (Có thể cuộn) --- */}
        <div className="px-6 py-2 overflow-y-auto flex-1 custom-scrollbar">
          {/* Input Add User */}
          <div className="mt-2 mb-6">
            <div className="relative border border-gray-300 rounded-md px-3 py-3 hover:border-gray-800 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all cursor-text">
              <span className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-blue-600 font-medium">
                Add users in project
              </span>
              <input
                type="text"
                className="w-full text-sm outline-none bg-transparent placeholder-gray-500"
                placeholder="Nhập tên hoặc email..."
              />
            </div>
          </div>

          {/* User List */}
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-800 mb-4">
              Permission Users
            </h3>
            <div className="flex flex-col gap-4">
              {users.map((user: User) => (
                <div key={user.id} className="flex items-center gap-3">
                  {/* Avatar */}
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[13px] text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Permissions Area */}
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
                            key={perm}
                            // onClick={() => togglePermission(user.id, perm)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors border ${
                              isActive
                                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                            }`}
                            title={`Press to ${isActive ? "delete" : "add"} permission ${perm}`}
                          >
                            {perm.charAt(0).toUpperCase() + perm.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-5 flex items-center justify-between rounded-b-3xl bg-white mt-auto">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-blue-600 text-sm font-medium hover:bg-blue-50/50 transition-colors">
            <Link2 size={18} />
            Copy link
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
