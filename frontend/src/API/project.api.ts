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
});
