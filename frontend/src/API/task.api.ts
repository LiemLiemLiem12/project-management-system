import { AxiosInstance } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Label {
  id: string;
  name: string;
  color_code: string;
}

export interface Task {
  id: string;
  project_id: string;
  group_task_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  assignee_id?: string;
  created_by: string;
  is_archived: boolean;
  labels: Label[];
}

export interface GroupTask {
  id: string;
  project_id: string;
  title: string;
  order: number;
  tasks: Task[];
}

export interface CreateTaskPayload {
  title: string;
  group_task_id: string;
  description?: string;
  due_date?: string;
  assignee_id?: string;
  label_ids?: string[];
}

export interface MoveTaskPayload {
  group_task_id: string;
  position: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const taskApi = (axiosPrivate: AxiosInstance) => ({
  getTask: (projectId: string, taskId: string) =>
    axiosPrivate.get<Task>(`/task/${projectId}/${taskId}`),

  // Kanban board
  getBoard: (projectId: string) =>
    axiosPrivate.get<GroupTask[]>(`/project/${projectId}/kanban`),

  // Task
  createTask: (projectId: string, payload: CreateTaskPayload) =>
    axiosPrivate.post<Task>(`/project/${projectId}/task`, payload),

  updateTask: (
    projectId: string,
    taskId: string,
    payload: Partial<CreateTaskPayload>,
  ) =>
    axiosPrivate.patch<Task>(`/project/${projectId}/task/${taskId}`, payload),

  moveTask: (projectId: string, taskId: string, payload: MoveTaskPayload) =>
    axiosPrivate.patch<Task>(
      `/project/${projectId}/task/${taskId}/move`,
      payload,
    ),

  deleteTask: (projectId: string, taskId: string) =>
    axiosPrivate.delete(`/project/${projectId}/task/${taskId}`),

  archiveTask: (projectId: string, taskId: string) =>
    axiosPrivate.patch(`/project/${projectId}/task/${taskId}/archive`),

  // Group Task
  createGroup: (projectId: string, title: string) =>
    axiosPrivate.post<GroupTask>(`/project/${projectId}/task/group`, { title }),

  updateGroup: (projectId: string, groupId: string, title: string) =>
    axiosPrivate.patch<GroupTask>(
      `/project/${projectId}/task/group/${groupId}`,
      { title },
    ),

  deleteGroup: (projectId: string, groupId: string) =>
    axiosPrivate.delete(`/project/${projectId}/task/group/${groupId}`),

  reorderGroups: (projectId: string, ordered_ids: string[]) =>
    axiosPrivate.patch<GroupTask[]>(
      `/project/${projectId}/task/group/reorder`,
      { ordered_ids },
    ),
 

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
