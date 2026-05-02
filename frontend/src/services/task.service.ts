"use client";
import { useAPI } from "@/API/useAPI";
import { useTaskStore } from "@/store/task.store";
import { CreateTaskPayload } from "@/API/task.api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Task } from "@/types";

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

// ─── My Tasks (Trang For You) ─────────────────────────────────────────────────

export const useGetMyTasks = () => {
  const api = useAPI();
  const { setMyTasks } = useTaskStore();

  return useQuery({
    queryKey: ["myTasks"],
    queryFn: async () => {
      const res = await api.task.getMyTasks(); // Nhớ thêm getMyTasks vào file task.api nhé!
      setMyTasks(res.data); // Nạp data thẳng vào store Zustand
      return res.data;
    },
    refetchOnWindowFocus: false,
    // Không cần enabled vì route này lúc nào cũng có thể gọi
  });
};

// ─── Create Task ──────────────────────────────────────────────────────────────

export const useGetTasks = (projectId: string) => {
  const api = useAPI();

  const query = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => api.task.getTasks(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data || ([] as Task[]),
    isPending: query.isPending,
  };
};

export const useCreateTask = (projectId: string) => {
  const api = useAPI();
  const { appendTask } = useTaskStore();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => {
      const res = api.task.createTask(projectId, payload);

      return res;
    },
    onSuccess: (res, variables) => {
      appendTask(res.data.group_task_id, res.data);
      if (variables.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ["currentTask", variables.parent_id],
        });
      }
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

export const useUpdateTask = () => {
  const api = useAPI();
  const queryClient = useQueryClient();
  const currentTask = useTaskStore((s: any) => s.currentTask);
  const mutation = useMutation({
    mutationFn: ({
      projectId,
      taskId,
      payload,
    }: {
      projectId: string;
      taskId: string;
      payload: Partial<CreateTaskPayload>;
    }) => api.task.updateTask(projectId, taskId, payload),

    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["currentTask", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["currentTask", currentTask?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["kanbanBoard", variables.projectId],
      });

      return res;
    },

    onError: (error: AxiosError) => {
      console.error("Failed to update task:", error.message);
      toast.error("Failed to update task. Please try again.");
    },
  });

  return {
    updateTask: mutation.mutate,
    updateTaskAsync: mutation.mutateAsync, // Dành cho trường hợp bạn cần await
    isPending: mutation.isPending,
  };
};

export const useRenameGroup = (projectId: string) => {
  const api = useAPI();
  const { setGroups } = useTaskStore();

  return useMutation({
    mutationFn: ({ groupId, title }: { groupId: string; title: string }) =>
      api.task.renameGroup(projectId, groupId, title),
    onMutate: ({ groupId, title }) => {
      // Optimistic update
      useTaskStore.setState((s) => ({
        groups: s.groups.map((g) => (g.id === groupId ? { ...g, title } : g)),
      }));
    },
    onError: async () => {
      // Rollback
      const res = await api.task.getBoard(projectId);
      setGroups(res.data);
    },
  });
};

export const useDeleteGroupWithFallback = (projectId: string) => {
  const api = useAPI();
  const { setGroups } = useTaskStore();

  return useMutation({
    mutationFn: ({
      groupId,
      fallbackGroupId,
    }: {
      groupId: string;
      fallbackGroupId: string;
    }) => api.task.deleteGroupWithFallback(projectId, groupId, fallbackGroupId),
    onSuccess: async () => {
      // Refetch để đảm bảo UI đồng bộ với DB sau khi chuyển task
      const res = await api.task.getBoard(projectId);
      setGroups(res.data);
    },
  });
};

export const useUpdateTaskStatus = (projectId: string) => {
  const api = useAPI();
  const { setGroups, optimisticMoveTask } = useTaskStore();

  return async (taskId: string, newGroupId: string) => {
    const groups = useTaskStore.getState().groups;

    // Tìm vị trí hiện tại của task
    let fromGroupId = "";
    let fromIndex = 0;
    let toIndex = 0;

    for (const g of groups) {
      const idx = g.tasks.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        fromGroupId = g.id;
        fromIndex = idx;
        break;
      }
    }

    // Append vào cuối group mới
    const toGroup = groups.find((g) => g.id === newGroupId);
    toIndex = toGroup ? toGroup.tasks.length : 0;

    if (!fromGroupId) return;

    // Optimistic update
    optimisticMoveTask({
      taskId,
      fromGroupId,
      toGroupId: newGroupId,
      fromIndex,
      toIndex,
    });

    // Sync lên server
    try {
      await api.task.moveTask(projectId, taskId, {
        group_task_id: newGroupId,
        position: toIndex,
      });
    } catch {
      const res = await api.task.getBoard(projectId);
      setGroups(res.data);
    }
  };
};

// ─── Delete Task (spreadsheet) ────────────────────────────────────────────────

export const useDeleteTask = (projectId: string) => {
  const api = useAPI();
  const { setGroups } = useTaskStore();

  return useMutation({
    mutationFn: (taskId: string) => api.task.deleteTask(projectId, taskId),
    onMutate: (taskId) => {
      // Optimistic: xóa khỏi store ngay
      useTaskStore.setState((s) => ({
        groups: s.groups.map((g) => ({
          ...g,
          tasks: g.tasks.filter((t) => t.id !== taskId),
        })),
      }));
    },
    onError: async () => {
      const res = await api.task.getBoard(projectId);
      setGroups(res.data);
    },
  });
};

export const useUploadMedias = () => {
  const api = useAPI();

  return useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await api.task.uploadMedias(payload);
      return res?.data;
    },
  });
};
