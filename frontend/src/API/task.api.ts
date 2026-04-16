import { AxiosInstance } from "axios";

export const taskApi = (axiosPrivate: AxiosInstance) => ({
  getTask: (projectId: string, taskId: string) => {
    return axiosPrivate.get(`/task/${projectId}/${taskId}`);
  },
});
