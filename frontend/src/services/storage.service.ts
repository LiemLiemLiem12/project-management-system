// src/hooks/useStorageHooks.ts
import { useAPI } from "@/API/useAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SyncUserPermissionPayload,
  CreateFolderPayload,
  UpdateStoragePayload,
} from "@/types";
import toast from "react-hot-toast";
import { Axios, AxiosError } from "axios";

export const useGetAssetsByFolder = (fileId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["assets", "folder", fileId],
    queryFn: async () => {
      const res = await api.storage.getAssetsByFolder(fileId);
      return res.data;
    },
    enabled: !!fileId,
    refetchOnWindowFocus: false,
  });
};

export const useGetAssetsByProject = (projectId: string, isRoot: boolean) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["assets", "project", projectId, isRoot],
    queryFn: async () => {
      const res = await api.storage.getAssetsByProject(projectId, isRoot);
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
};

export const useGetStorageUsage = (projectId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["storage", "usage", projectId],
    queryFn: async () => {
      const res = await api.storage.getStorageUsage(projectId);
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
};

export const useGetRecentAssets = (projectId: string, limit: number = 10) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["assets", "recent", projectId, limit],
    queryFn: async () => {
      const res = await api.storage.getRecentAssets(projectId, limit);
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
};

// --- MUTATIONS ---

export const useSyncUserPermission = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncUserPermissionPayload) => {
      return api.storage.syncUserPermission(payload);
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully.");

      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      console.error("Failed to sync user permission:", error);
      toast.error("Failed to update permissions.");
    },
  });
};

export const useCreateFolder = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFolderPayload) => {
      return api.storage.createFolder(payload);
    },
    onSuccess: () => {
      // Invalidate chung mảng assets để cập nhật UI ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Folder created successfully.");
    },
    onError: (error: any) => {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder.");
    },
  });
};

export const useCreateAsset = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentId, formData, onUploadProgress }: any) => {
      const response = await api.storage.createAsset(
        parentId,
        formData,
        onUploadProgress,
      );

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Files uploaded successfully.");
    },
    onError: (error: any) => {
      console.error("Failed to upload files:", error.response?.data);
      toast.error(error.response?.data?.message || "");
    },
  });
};

export const useUpdateAsset = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      payload,
    }: {
      fileId: string;
      payload: UpdateStoragePayload;
    }) => {
      return api.storage.updateAsset(fileId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      console.error("Failed to update asset:", error.response?.data);
      toast.error(error.response?.data?.message);
    },
  });
};

export const useDeleteAsset = () => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => {
      return api.storage.deleteAsset(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Item deleted successfully.");
    },
    onError: (error: any) => {
      console.error("Failed to delete asset:", error.response?.data?.message);
      toast.error(error.response?.data?.message);
    },
  });
};
