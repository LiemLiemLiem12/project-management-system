"use client";

import { useGetUserById, useGetUsersById } from "@/services/user.service";
import { Asset } from "@/types";
import { useMemo } from "react";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function getFileTypeLabel(fileType: string | null): string {
  if (!fileType) return "Unknown";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  if (fileType === "application/pdf") return "PDF";
  if (
    fileType.includes("word") ||
    fileType.includes("document") ||
    fileType === "text/plain"
  )
    return "Document";
  if (fileType.includes("sheet") || fileType.includes("excel"))
    return "Spreadsheet";
  if (fileType.includes("presentation")) return "Presentation";
  return "File";
}

export default function FileDetailPanel({
  file,
  onClose,
  setOpenPermissionModal,
}: {
  file: Asset;
  onClose: () => void;
  setOpenPermissionModal: (bool: boolean) => void;
}) {
  const userIds = useMemo(() => {
    if (!file.permissions) return [];
    return Array.from(new Set(file.permissions.map((p) => p.userId)));
  }, [file.permissions]);

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

  const { data: users, isPending: pendingUser } = useGetUsersById(userIds);

  const { data: uploadByUser, isPending: pendingUploadedBy } = useGetUserById(
    file.uploadedBy,
  );

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {file.name}
        </p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="px-5 pt-4 pb-3">
        {file.storageUrl && file.fileType?.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.storageUrl}
            alt={file.name}
            className="w-full h-44 object-cover rounded-xl"
          />
        ) : file.isFolder ? (
          <div className="w-full h-44 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-600"
            >
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="w-full h-44 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="px-5 overflow-y-auto flex-1 space-y-5 pb-6">
        {/* File Details */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">
            File Details
          </p>
          <div className="space-y-3">
            <DetailRow
              label="Type"
              value={file.isFolder ? "Folder" : getFileTypeLabel(file.fileType)}
            />
            <DetailRow label="Size" value={formatFileSize(file.fileSize)} />
            <DetailRow label="ID" value={file.id.substring(0, 8) + "..."} />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Metadata */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">Metadata</p>
          <div className="space-y-3">
            <DetailRow label="Created" value={formatDate(file.createdAt)} />
            <DetailRow label="Modified" value={formatDate(file.updatedAt)} />
            <DetailRow
              label="Uploaded By"
              value={
                pendingUploadedBy
                  ? "Loading..."
                  : uploadByUser?.fullName || "Unknown"
              }
            />
          </div>
        </div>

        {/* Permissions */}
        {groupedPermissions.length > 0 && (
          <>
            <div className="border-t border-gray-100" />
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Access</p>

              {/* Skeleton loading sửa lại lấy theo userIds.length thay vì file.permissions.length */}
              {pendingUser ? (
                <div className="space-y-3">
                  {userIds.map((uid) => (
                    <div
                      key={uid}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                      <div className="flex flex-col gap-1 w-full">
                        <div className="h-3.5 bg-gray-200 rounded w-24" />
                        <div className="h-2.5 bg-gray-100 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Đã load xong dữ liệu user và render grouped permissions */
                <div className="space-y-3">
                  {groupedPermissions.map((group) => {
                    const user = users?.find((u: any) => u.id === group.userId);

                    const displayName =
                      user?.fullName || group.userId.substring(0, 8);
                    const initial = displayName.charAt(0).toUpperCase();

                    return (
                      <div
                        key={group.userId}
                        className="text-sm text-gray-600 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          {user?.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={displayName}
                              className="w-7 h-7 rounded-full object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {initial}
                            </div>
                          )}

                          <div className="flex flex-col leading-tight truncate">
                            <span className="font-medium text-gray-900 truncate">
                              {displayName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
                          {group.perms.map((perm) => (
                            <span
                              key={perm}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded capitalize border border-gray-100"
                            >
                              {perm.toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setOpenPermissionModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Grant Permission
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions Footer */}
      {/* {file.storageUrl && !file.isFolder && (
        <div className="border-t border-gray-100 px-5 py-3">
          <a
            href={file.storageUrl}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M4 6l4 4 4-4M2 14h12"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download
          </a>
        </div>
      )} */}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 break-all">{value}</p>
    </div>
  );
}
