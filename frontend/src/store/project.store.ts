import { create } from "zustand";
import { ProjectMember } from "@/API/project.api";

interface ProjectState {
  currentProject: any | null;
  members: ProjectMember[];
  currentUserRole: "Leader" | "Moderator" | "Member" | null;

  setCurrentProject: (project: any) => void;
  setMembers: (
    members: ProjectMember[],
    role: "Leader" | "Moderator" | "Member" | null,
  ) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  members: [],
  currentUserRole: null,

  setCurrentProject: (project) => set({ currentProject: project }),

  setMembers: (members, currentUserRole) => set({ members, currentUserRole }),
}));
