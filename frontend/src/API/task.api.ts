import { AxiosInstance } from "axios";

export const taskApi = (axiosPrivate: AxiosInstance) => ({
  getTask: (taskId: string) => {
    return axiosPrivate.get(`/tasks/${taskId}`);
  },

  searchTaskForSubtask: (
    keyword: string,
    projectId: string,
    taskId: string,
  ) => {
    return axiosPrivate.get(`/tasks/${taskId}/subtasks`, {
      params: { keyword },
    });
  },

  addExistingSubtask: (taskId: string, subtaskId: string) => {
    return axiosPrivate.post(`/tasks/${taskId}/subtasks`, { subtaskId });
  },

  getGroupTaskByProjectId: (projectId: string) => {
    return axiosPrivate.get(`/tasks/group`, {
      params: { projectId },
    });
  },

  updateTaskGroupTask: (taskId: string, groupTaskId: string) => {
    return axiosPrivate.patch(`/tasks/${taskId}`, { groupTaskId });
  },
});
