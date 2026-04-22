import { useAPI } from "@/API/useAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateLabelPayload, UpdateLabelPayload } from "@/types";
import toast from "react-hot-toast";

export const useGetLabels = (projectId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["labels", projectId],
    queryFn: async () => {
      const res = await api.label.getLabels(projectId);
      return res.data;
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
};

export const useCreateLabel = (projectId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabelPayload) => {
      return api.label.createLabel(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["labels", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentProject", projectId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to create label:", error);
      toast.error("Failed to create label.");
    },
  });
};

export const useUpdateLabel = (projectId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      labelId,
      payload,
    }: {
      labelId: string;
      payload: UpdateLabelPayload;
    }) => {
      return api.label.updateLabel(labelId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["labels", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentProject", projectId],
      });
      // Nếu label hiển thị trên task, có thể bạn muốn invalidate cả tasks
      queryClient.invalidateQueries({
        queryKey: ["kanbanBoard", projectId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to update label:", error);
      toast.error("Failed to update label.");
    },
  });
};

export const useDeleteLabel = (projectId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => {
      return api.label.deleteLabel(labelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["labels", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentProject", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["kanbanBoard", projectId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete label:", error);
      toast.error("Failed to delete label.");
    },
  });
};
