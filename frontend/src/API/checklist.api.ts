import {
  Checklist,
  CreateChecklistPayload,
  UpdateChecklistPayload,
} from "@/types";
import { AxiosInstance } from "axios";

export const checklistApi = (axiosPrivate: AxiosInstance) => ({
  getChecklists: (taskId: string) =>
    axiosPrivate.get<Checklist[]>(`/checklists/task/${taskId}`),

  createChecklist: (taskId: string, payload: CreateChecklistPayload) =>
    axiosPrivate.post<Checklist>(`/checklists`, {
      ...payload,
      task_id: taskId,
    }),

  updateChecklist: (checklistId: string, payload: UpdateChecklistPayload) =>
    axiosPrivate.patch<Checklist>(`/checklists/${checklistId}`, payload),

  deleteChecklist: (checklistId: string) =>
    axiosPrivate.delete(`/checklists/${checklistId}`),
});
