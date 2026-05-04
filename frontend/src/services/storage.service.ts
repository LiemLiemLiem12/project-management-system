// src/hooks/useStorageHooks.ts
import { useAPI } from "@/API/useAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SyncUserPermissionPayload,
  CreateFolderPayload,
  UpdateStoragePayload,
} from "@/types";
import toast from "react-hot-toast";

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

// --- MUTATIONS ---

export const useSyncUserPermission = () => {
  const api = useAPI();

  return useMutation({
    mutationFn: (payload: SyncUserPermissionPayload) => {
      return api.storage.syncUserPermission(payload);
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully.");
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
    mutationFn: ({
      parentId,
      formData,
    }: {
      parentId?: string;
      formData: FormData;
    }) => {
      return api.storage.createAsset(parentId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Files uploaded successfully.");
    },
    onError: (error: any) => {
      console.error("Failed to upload files:", error);
      toast.error("Failed to upload files.");
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
      console.error("Failed to update asset:", error);
      toast.error("Failed to update item.");
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
      console.error("Failed to delete asset:", error);
      toast.error("Failed to delete item.");
    },
  });
};
