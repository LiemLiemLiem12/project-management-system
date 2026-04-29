import { Comment, CreateCommentPayload, UpdateCommentPayload } from "@/types";
import axios, { AxiosInstance } from "axios";

export const commentApi = (axiosPrivate: AxiosInstance) => ({
  getComments: (taskId: string) =>
    axiosPrivate.get<Comment[]>(`/comments/task/${taskId}`),

  createComment: (payload: FormData) =>
    axiosPrivate.post<Comment>(`/comments`, payload),

  updateComment: (commentId: string, payload: UpdateCommentPayload) =>
    axiosPrivate.patch<Comment>(`/comments/${commentId}`, payload),

  deleteComment: (commentId: string, body?: any) =>
    axiosPrivate.delete(`/comments/${commentId}`, { data: body }),

  summarizeTaskComments: (taskId: string) =>
    axiosPrivate.get(`/comments/summary/task/${taskId}`),

  getSubComments: (taskId: string) => axiosPrivate.get(`/comments/${taskId}`),
});
