import { AxiosInstance } from "axios";
import { Task as TypeTask } from "@/types";

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
  position?: number;
  start_date?: string;
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
  isSuccess: boolean;
  tasks: Task[];
}

export interface CreateTaskPayload {
  title: string;
  group_task_id: string | null;
  description?: string;
  start_date?: string;
  due_date?: string | null;
  assignee_id?: string | null;
  label_ids?: string[];
  parent_id?: string | null;
}

export interface MoveTaskPayload {
  group_task_id: string;
  position: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const taskApi = (axiosPrivate: AxiosInstance) => ({
  getTask: (projectId: string, taskId: string) =>
    axiosPrivate.get<Task>(`/tasks/${projectId}/task/${taskId}`),
  getMyTasks: () => axiosPrivate.get("/tasks/my-tasks"),

  // Kanban board
  getBoard: (projectId: string) =>
    axiosPrivate.get<GroupTask[]>(`/tasks/${projectId}/kanban`),

  // Task
  getTasks: (projectId: string) =>
    axiosPrivate.get<TypeTask[]>(`/tasks/project/${projectId}`),

  createTask: (projectId: string, payload: CreateTaskPayload) => {
    return axiosPrivate.post<Task>(`/tasks/${projectId}/task`, payload);
  },

  updateTask: (
    projectId: string,
    taskId: string,
    payload: Partial<CreateTaskPayload>,
  ) => axiosPrivate.patch<Task>(`/tasks/${projectId}/task/${taskId}`, payload),

  moveTask: (projectId: string, taskId: string, payload: MoveTaskPayload) =>
    axiosPrivate.patch<Task>(
      `/tasks/${projectId}/task/${taskId}/move`,
      payload,
    ),

  deleteTask: (projectId: string, taskId: string) =>
    axiosPrivate.delete(`/tasks/${projectId}/task/${taskId}`),

  archiveTask: (projectId: string, taskId: string) =>
    axiosPrivate.patch(`/tasks/${projectId}/task/${taskId}/archive`),

  // Group Task
  createGroup: (projectId: string, title: string) =>
    axiosPrivate.post<GroupTask>(`/tasks/${projectId}/task/group`, { title }),

  updateGroup: (projectId: string, groupId: string, title: string) =>
    axiosPrivate.patch<GroupTask>(`/tasks/${projectId}/task/group/${groupId}`, {
      title,
    }),

  deleteGroup: (projectId: string, groupId: string) =>
    axiosPrivate.delete(`/tasks/${projectId}/task/group/${groupId}`),

  reorderGroups: (projectId: string, ordered_ids: string[]) =>
    axiosPrivate.patch<GroupTask[]>(`/tasks/${projectId}/task/group/reorder`, {
      ordered_ids,
    }),

  searchTaskForSubtask: (
    keyword: string,
    projectId: string,
    taskId: string,
  ) => {
    return axiosPrivate.get(`/tasks/${taskId}/subtasks`, {
      params: { keyword, projectId },
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

  updateTaskGroupTask: (taskId: string, group_task_id: string) => {
    return axiosPrivate.patch(`/tasks/${taskId}`, { group_task_id });
  },

  renameGroup: (projectId: string, groupId: string, title: string) =>
    axiosPrivate.patch(`/tasks/${projectId}/task/group/${groupId}/rename`, {
      title,
    }),

  deleteGroupWithFallback: (
    projectId: string,
    groupId: string,
    fallbackGroupId: string,
  ) =>
    axiosPrivate.delete(
      `/tasks/${projectId}/task/group/${groupId}/with-fallback`,
      {
        data: { fallbackGroupId },
      },
    ),
});
