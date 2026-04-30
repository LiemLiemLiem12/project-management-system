import { useAPI } from "@/API/useAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateCommentPayload, UpdateCommentPayload } from "@/types";
import toast from "react-hot-toast";

export const useGetComments = (taskId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const res = await api.comment.getComments(taskId);
      return res.data;
    },
    enabled: !!taskId,
    refetchOnWindowFocus: false,
  });
};

export const useCreateComment = (taskId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => {
      return api.comment.createComment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["currentTask", taskId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to create comment:", error.response.data);
      toast.error("Failed to post comment.");
    },
  });
};

export const useUpdateComment = (taskId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateCommentPayload;
    }) => {
      // Include taskId in payload for WebSocket broadcast
      return api.comment.updateComment(commentId, {
        ...payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", taskId],
      });
      // Invalidate thêm task nếu có thay đổi liên quan
      queryClient.invalidateQueries({
        queryKey: ["currentTask", taskId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment.");
    },
  });
};

export const useDeleteComment = (taskId: string) => {
  const api = useAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => {
      // Include taskId in body for WebSocket broadcast
      return api.comment.deleteComment(commentId, { taskId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentTask", taskId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment.");
    },
  });
};

export const useSummarizeTaskComments = (taskId: string) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["commentsSummary", taskId],
    queryFn: async () => {
      const res = await api.comment.summarizeTaskComments(taskId);
      return res.data;
    },
    enabled: !!taskId,
    refetchOnWindowFocus: false,
  });
};

export const useGetSubComments = (id: string, showSubComments: boolean) => {
  const api = useAPI();

  return useQuery({
    queryKey: ["subComments", id],
    queryFn: async () => {
      const res = await api.comment.getSubComments(id);
      return res.data;
    },
    enabled: !!id && !!showSubComments,
    refetchOnWindowFocus: false,
  });
};
