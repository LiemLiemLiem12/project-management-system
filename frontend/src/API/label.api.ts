import { Label, CreateLabelPayload, UpdateLabelPayload } from "@/types";
import { AxiosInstance } from "axios";

export const labelApi = (axiosPrivate: AxiosInstance) => ({
  getLabels: (projectId: string) =>
    axiosPrivate.get<Label[]>(`/labels/project/${projectId}`),

  createLabel: (payload: CreateLabelPayload) =>
    axiosPrivate.post<Label>(`/labels`, payload),

  updateLabel: (labelId: string, payload: UpdateLabelPayload) =>
    axiosPrivate.patch<Label>(`/labels/${labelId}`, payload),

  deleteLabel: (labelId: string) => axiosPrivate.delete(`/labels/${labelId}`),
});
