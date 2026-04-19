import { useAPI } from "@/API/useAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateChecklistPayload, UpdateChecklistPayload } from "@/types";
import toast from "react-hot-toast";

export const useGetChecklists = (taskId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["checklists", taskId],
    queryFn: async () => {
      const res = await api.checklist.getChecklists(taskId);
      return res.data;
    },
    enabled: !!taskId,
    refetchOnWindowFocus: false,
  });
};

export const useCreateChecklist = (taskId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChecklistPayload) => {
      return api.checklist.createChecklist(taskId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklists", taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["currentTask", taskId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to create checklist:", error);
      toast.error("Failed to create checklist item.");
    },
  });
};

export const useUpdateChecklist = (taskId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checklistId,
      payload,
    }: {
      checklistId: string;
      payload: UpdateChecklistPayload;
    }) => {
      return api.checklist.updateChecklist(checklistId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklists", taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentTask", taskId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to update checklist:", error);
      toast.error("Failed to update checklist item.");
    },
  });
};

export const useDeleteChecklist = (taskId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checklistId: string) => {
      return api.checklist.deleteChecklist(checklistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checklists", taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentTask", taskId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete checklist:", error);
      toast.error("Failed to delete checklist item.");
    },
  });
};
