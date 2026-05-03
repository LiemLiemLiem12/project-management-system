"use client";

import axios from "axios";
import { useAPI } from "@/API/useAPI";
import { useProjectStore } from "@/store/project.store";
import { AddMemberPayload, UpdateMemberRolePayload } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const RESERVED_ROUTES = ["for-you", "favourite"];

// Hàm phụ trợ để bóc tách lỗi chuẩn từ Backend (NestJS / Gateway)
const getErrorMessage = (error: any, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    const backendMessage = error.response?.data?.message;
    // Xử lý trường hợp class-validator của NestJS trả về mảng lỗi
    return Array.isArray(backendMessage)
      ? backendMessage[0]
      : backendMessage || defaultMessage;
  }
  return error?.message || defaultMessage;
};

export const useGetCurrentProject = (projectId?: string) => {
  const api = useAPI();
  const router = useRouter();
  const setCurrentProject = useProjectStore((s: any) => s.setCurrentProject);

  const isRealProject = !!projectId && !RESERVED_ROUTES.includes(projectId);

  const query = useQuery({
    queryKey: ["currentProject", projectId],
    queryFn: async () => {
      // 1. Thực hiện gọi API
      const res = await api.project.getProjects(projectId!);
      return res.data;
    },
    enabled: isRealProject,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setCurrentProject(query.data);
    }

    if (query.isError) {
      router.push("/not-found");
    }
  }, [query.data, query.isError, setCurrentProject, router]);

  return query;
};

export const useGetProjectMembers = (projectId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: async () => {
      const res = await api.project.getMembers(projectId);
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
};

// 2. POST: Thêm thành viên vào dự án
export const useAddProjectMember = (projectId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddMemberPayload) => {
      return api.project.addMember(projectId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentProject", projectId],
      });
      toast.success("Đã thêm thành viên thành công!");
    },
    onError: (error: any) => {
      console.error("Failed to add project member:", error);
      toast.error(getErrorMessage(error, "Lỗi khi thêm thành viên vào dự án."));
    },
  });
};

// 3. PATCH: Cập nhật role của thành viên
export const useUpdateMemberRole = (projectId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateMemberRolePayload;
    }) => {
      return api.project.updateMemberRole(projectId, userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentProject", projectId],
      });
      toast.success("Cập nhật vai trò thành công!");
    },
    onError: (error: any) => {
      console.error("Failed to update member role:", error);
      toast.error(getErrorMessage(error, "Lỗi khi cập nhật vai trò."));
    },
  });
};

// 4. DELETE: Xóa thành viên
export const useRemoveProjectMember = (projectId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      return api.project.removeMember(projectId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentProject", projectId],
      });
      toast.success("Đã xóa thành viên khỏi dự án!");
    },
    onError: (error: any) => {
      console.error("Failed to remove project member:", error);
      toast.error(getErrorMessage(error, "Lỗi khi xóa thành viên khỏi dự án."));
    },
  });
};

export const useProjectService = () => {
  const api = useAPI();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleCreateProject = useMutation({
    mutationFn: (payload: {
      name: string;
      description: string;
      members: { email: string; role: string }[];
    }) => api.project.createProject(payload),

    onSuccess: () => {
      toast.success("Tạo dự án và bảng Kanban thành công!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/for-you");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Lỗi khi tạo dự án."));
    },
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.project.getUserProjects(),
  });

  return {
    createProject: handleCreateProject.mutateAsync,
    isCreating: handleCreateProject.isPending,
    projects: projectsData?.data || [],
    isLoadingProjects,
  };
};
