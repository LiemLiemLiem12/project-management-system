import { AxiosInstance } from "axios";

export const taskApi = (axiosPrivate: AxiosInstance) => ({
  getTask: (projectId: string, taskId: string) => {
    return axiosPrivate.get(`/task/${projectId}/${taskId}`);
  },

  searchTaskForSubtask: (
    keyword: string,
    projectId: string,
    taskId: string,
  ) => {
    return axiosPrivate.get(`/task/${projectId}/${taskId}/subtasks/search`, {
      params: { keyword },
    });
  },

  addExistingSubtask: (taskId: string, subtaskId: string) => {
    return axiosPrivate.post(`/task/${taskId}/subtasks`, { subtaskId });
  },
});
