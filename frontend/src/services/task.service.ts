"use client";
import { useAPI } from "@/API/useAPI";
import { useTaskStore } from "@/store/task.store";
import { CreateTaskPayload } from "@/API/task.api";
import { useRouter } from "next/navigation"; 
import { useEffect } from "react"; 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";



// ─── Fetch board — gọi ở component ngoài cùng (KanbanBoard) ──────────────────

export const useGetKanbanBoard = (projectId: string) => {
  const api = useAPI();
  const { setGroups, setLoading, setError } = useTaskStore();

  return useQuery({
    queryKey: ["kanbanBoard", projectId],
    queryFn: async () => {
      const res = await api.task.getBoard(projectId);
      setGroups(res.data); // gắn vào store
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
  });
};

// ─── Create Task ──────────────────────────────────────────────────────────────

export const useCreateTask = (projectId: string) => {
  const api = useAPI();
  const { appendTask } = useTaskStore();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      api.task.createTask(projectId, payload),
    onSuccess: (res) => {
      appendTask(res.data.group_task_id, res.data);
    },
  });
};

// ─── Move Task — optimistic, gọi ở KanbanBoard (ngoài cùng) ──────────────────

export const useMoveTask = (projectId: string) => {
  const api = useAPI();
  const { optimisticMoveTask, setGroups } = useTaskStore();

  return ({
    taskId,
    fromGroupId,
    toGroupId,
    fromIndex,
    toIndex,
  }: {
    taskId: string;
    fromGroupId: string;
    toGroupId: string;
    fromIndex: number;
    toIndex: number;
  }) => {
    // 1. Cập nhật UI ngay
    optimisticMoveTask({ taskId, fromGroupId, toGroupId, fromIndex, toIndex });

    // 2. Sync lên server trong nền
    api.task
      .moveTask(projectId, taskId, {
        group_task_id: toGroupId,
        position: toIndex,
      })
      .catch(async () => {
        // Rollback nếu lỗi
        const res = await api.task.getBoard(projectId);
        setGroups(res.data);
      });
  };
};

// ─── Reorder Groups — optimistic, gọi ở KanbanBoard (ngoài cùng) ─────────────

export const useReorderGroups = (projectId: string) => {
  const api = useAPI();
  const { optimisticReorderGroups, setGroups } = useTaskStore();

  return (ordered_ids: string[]) => {
    optimisticReorderGroups(ordered_ids);

    api.task.reorderGroups(projectId, ordered_ids).catch(async () => {
      const res = await api.task.getBoard(projectId);
      setGroups(res.data);
    });
  };
};

// ─── Create Group ─────────────────────────────────────────────────────────────

export const useCreateGroup = (projectId: string) => {
  const api = useAPI();
  const { appendGroup } = useTaskStore();

  return useMutation({
    mutationFn: (title: string) => api.task.createGroup(projectId, title),
    onSuccess: (res) => {
      appendGroup(res.data);
    },
  });
};


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
