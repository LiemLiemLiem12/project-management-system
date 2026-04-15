import { create } from "zustand";

export const useProjectStore = create((set, get) => ({
  currentProject: null,

  setCurrentProject: (id: string) => set({ currentProject: id }),
}));
