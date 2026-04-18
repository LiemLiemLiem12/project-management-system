export interface User {
  id: string;
  email: string;
  username: string;
  fullname: string;
  provider: string;
  avatarUrl: string;
  birthday: string;
  createdAt: string;
}

//Task Detail Page
export interface TaskSearchItem {
  id: string;
  title: string;
}

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color_code: string;
}

export interface GroupTask {
  id: string;
  project_id: string;
  title: string;
  order: number;
  isSuccess: boolean;
}

export interface TaskBase {
  id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null; // ISO Date string
  assignee_id: string | null;
  created_by: string;
  group_task_id: string;
  is_archived: boolean;
}

export interface Task extends TaskBase {
  groupTask: GroupTask;
  labels: Label[];
  subtasks: TaskBase[];
  checklists: any[];
}
