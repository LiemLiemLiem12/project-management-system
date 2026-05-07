// src/API/services/storageApi.ts
import { AxiosInstance } from "axios";
import {
  SyncUserPermissionPayload,
  CreateFolderPayload,
  UpdateStoragePayload,
  Asset,
} from "@/types";

export const storageApi = (axiosPrivate: AxiosInstance) => ({
  syncUserPermission: (payload: SyncUserPermissionPayload) =>
    axiosPrivate.post("/storages/role", payload),

  createFolder: (payload: CreateFolderPayload) =>
    axiosPrivate.post<Asset>("/storages/folder", payload),

  createAsset: (
    parentId: string | undefined,
    formData: FormData,
    onUploadProgress: any,
  ) =>
    axiosPrivate.post<Asset>(
      parentId ? `/storages?parentId=${parentId}` : "/storages",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onUploadProgress,
      },
    ),

  getAssetsByFolder: (fileId: string) =>
    axiosPrivate.get(`/storages/folder/${fileId}`),

  getAssetsByProject: (projectId: string, isRoot: boolean) =>
    axiosPrivate.get<Asset[]>(
      `/storages/project/${projectId}?isRoot=${isRoot}`,
    ),

  getAssetsByTaskId: (taskId: string) =>
    axiosPrivate.get<Asset[]>(`/storages/task/${taskId}`),

  updateAsset: (fileId: string, payload: UpdateStoragePayload) =>
    axiosPrivate.patch<Asset>(`/storages/${fileId}`, payload),

  deleteAsset: (fileId: string) => axiosPrivate.delete(`/storages/${fileId}`),

  // Get storage usage info (used/max storage)
  getStorageUsage: (projectId: string) =>
    axiosPrivate.get<{
      usedBytes: number;
      maxBytes: number;
      breakdown: Array<{ type: string; bytes: number }>;
    }>(`/storages/usage/${projectId}`),

  // Get recently modified files
  getRecentAssets: (projectId: string, limit: number = 10) =>
    axiosPrivate.get<Asset[]>(`/storages/recent/${projectId}?limit=${limit}`),
});
