import { Comment, CreateCommentPayload, UpdateCommentPayload } from "@/types";
import { AxiosInstance } from "axios";

export const commentApi = (axiosPrivate: AxiosInstance) => ({
  getComments: (taskId: string) =>
    axiosPrivate.get<Comment[]>(`/comments/task/${taskId}`),

  createComment: (taskId: string, payload: CreateCommentPayload) =>
    axiosPrivate.post<Comment>(`/comments`, {
      ...payload,
      task_id: taskId,
    }),

  updateComment: (commentId: string, payload: UpdateCommentPayload) =>
    axiosPrivate.patch<Comment>(`/comments/${commentId}`, payload),

  deleteComment: (commentId: string) =>
    axiosPrivate.delete(`/comments/${commentId}`),

  summarizeTaskComments: (taskId: string) =>
    axiosPrivate.get(`/comments/summary/task/${taskId}`),
});
