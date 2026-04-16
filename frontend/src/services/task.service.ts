import { useAPI } from "@/API/useAPI";
import { useTaskStore } from "@/store/task.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useGetCurrentTask = (projectId: string, taskId: string) => {
  const api = useAPI();
  const setCurrentTask = useTaskStore((s: any) => s.setCurrentTask);
  const router = useRouter();
  const query = useQuery({
    queryKey: ["currentTask", taskId],
    queryFn: async () => {
      const res = await api.task.getTask(projectId, taskId);
      return res.data;
    },
    enabled: !!projectId && !!taskId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.isError) {
      const error: any = query.error;
      const msg = error.response?.data?.message || error.message;
      console.error("Failed to fetch task:", msg);
      router.push("/not-found");
    }

    if (query.data) {
      setCurrentTask(query.data);
    }
  }, [query.data, query.error]);

  return query;
};

export const useSearchTaskForSubtask = (
  keyword: string,
  projectId: string,
  taskId: string,
) => {
  const api = useAPI();

  const query = useQuery({
    queryKey: ["searchTaskForSubtask", keyword, projectId, taskId],
    queryFn: () => api.task.searchTaskForSubtask(keyword, projectId, taskId),
    enabled: !!keyword && !!projectId && !!taskId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data || [],
    isPending: query.isLoading,
  };
};

export const useAddExistingSubtask = () => {
  const api = useAPI();
  const queryClient = useQueryClient(); // 1. Khởi tạo queryClient

  const mutation = useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
    }: {
      taskId: string;
      subtaskId: string;
    }) => api.task.addExistingSubtask(taskId, subtaskId),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["currentTask", variables.taskId],
      });
    },

    onError: (error) => {
      console.error("Add subtask failed:", error);
    },
  });

  return {
    addExistingSubtask: mutation.mutate,
    isPending: mutation.isPending,
  };
};
