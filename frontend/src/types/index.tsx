import { AssetPermissionEnum } from "@/enums/asset-permission.enum";

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  provider: string;
  avatarUrl: string;
  birthday: string;
  createdAt: string;
}

//Task Interface

export interface TaskSearchItem {
  id: string;
  title: string;
}

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color_code: string;
  project?: any;
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
  parent: Task;
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
  checklists: Checklist[];
}

//Checklist

export interface Checklist {
  id: string;
  title: string;
  is_completed: boolean;
  position: number;
  task_id: string;
}

export interface CreateChecklistPayload {
  title: string;
}

export interface UpdateChecklistPayload {
  title?: string;
  is_completed?: boolean;
  position?: number;
}

//Project Member
export interface AddMemberPayload {
  user_id: string;
  role: string;
}

export interface UpdateMemberRolePayload {
  role: string;
}

//Label
export interface CreateLabelPayload {
  project_id: string;
  name: string;
  color_code: string;
}

export interface UpdateLabelPayload {
  name: string;
  color_code: string;
}

//Comment
export interface Comment {
  id: string;
  parent_comment_id: string | null;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  medias: CommentMedia[];
  subCommentCount?: number;
  user?: User;
}

export interface CommentMedia {
  id: string;
  comment_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: Date;
  comment?: Comment;
}

export interface CommentMediaPayload {
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

export interface CreateCommentPayload {
  task_id?: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null;
  medias?: CommentMediaPayload[];
}

export interface UpdateCommentPayload extends Partial<CreateCommentPayload> {
  id: number;
}

//Storage

export interface SyncUserPermissionPayload {
  fileId: string;
  userId: string;
  newPermissions: string[];
}

export interface CreateFolderPayload {
  name?: string;
  parentId?: string;
  projectId: string;
}

export interface UpdateStoragePayload {
  name?: string;
  parentId?: string;
  projectId?: string;
  isFolder?: boolean;
  fileType?: string;
  fileSize?: number;
  storageUrl?: string;
  publicId?: string;
  uploadedBy?: string;
}

export interface AssetPermission {
  id: string;
  fileId: string;
  userId: string;
  permission: string;

  file?: Asset;
}

export interface Asset {
  id: string;
  parentId: string | null;
  projectId: string;
  name: string;
  isFolder: boolean;

  fileType: string | null;
  fileSize: number;
  storageUrl: string | null;
  publicId: string | null;
  uploadedBy: string;
  isDeleted: number;

  createdAt: string;
  updatedAt: string;

  parent?: Asset | null;
  permissions?: AssetPermission[];
  children?: Asset[];
  canView: boolean;
}
