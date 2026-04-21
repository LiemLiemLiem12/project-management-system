import { AddMemberPayload, UpdateMemberRolePayload } from "@/types";
import { AxiosInstance } from "axios";

export interface ProjectMember {
  user_id: string;
  role: "Leader" | "Member";
  joined_date: string;
  full_name?: string;
  avatar_url?: string;
}

export interface ProjectMembersResponse {
  members: ProjectMember[];
  currentUserRole: "Leader" | "Member" | null;
}

export const projectAPI = (axiosPrivate: AxiosInstance) => ({
  getProjects: (id: string) => {
    return axiosPrivate.get(`/project/${id}`);
  },

  getMembers: (projectId: string) => {
    return axiosPrivate.get<ProjectMember[]>(`/project/${projectId}/members`);
  },

  addMember: (projectId: string, payload: AddMemberPayload) => {
    return axiosPrivate.post(`/projects/${projectId}/members`, payload);
  },

  updateMemberRole: (
    projectId: string,
    userId: string,
    payload: UpdateMemberRolePayload,
  ) => {
    return axiosPrivate.patch(
      `/projects/${projectId}/members/${userId}`,
      payload,
    );
  },

  removeMember: (projectId: string, userId: string) => {
    return axiosPrivate.delete(`/projects/${projectId}/members/${userId}`);
  },
});
