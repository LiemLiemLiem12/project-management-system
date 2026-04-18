import { useAPI } from "@/API/useAPI";
import { useTaskStore } from "@/store/task.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const useGetCurrentTask = (projectId: string, taskId: string) => {
  const api = useAPI();
  const setCurrentTask = useTaskStore((s: any) => s.setCurrentTask);
  const router = useRouter();
  const query = useQuery({
    queryKey: ["currentTask", taskId],
    queryFn: async () => {
      const res = await api.task.getTask(taskId);
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

export const useGetGroupTaskByProjectId = (projectId: string) => {
  const api = useAPI();

  const query = useQuery({
    queryKey: ["groupTasks", projectId],
    queryFn: () => api.task.getGroupTaskByProjectId(projectId),
    enabled: !!projectId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data || [],
    isPending: query.isLoading,
  };
};

export const useUpdateTaskGroupTask = () => {
  const api = useAPI();
  const queryClient = useQueryClient();
  const currentTask = useTaskStore((s: any) => s.currentTask);

  const mutation = useMutation({
    mutationFn: ({
      taskId,
      groupTaskId,
    }: {
      taskId: string;
      groupTaskId: string;
    }) => api.task.updateTaskGroupTask(taskId, groupTaskId),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["currentTask", currentTask?.id],
      });
    },

    onError: (error) => {
      // const msg = error.response?.data?.message || error.message;
      console.error("Failed to update group task:", error.message);
      toast.error("Failed to update group task. Please try again.");
    },
  });

  return {
    updateTaskGroupTask: mutation.mutate,
    isPending: mutation.isPending,
  };
};
