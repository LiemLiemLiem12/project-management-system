import { useAPI } from "@/API/useAPI";
import { useTaskStore } from "@/store/task.store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
