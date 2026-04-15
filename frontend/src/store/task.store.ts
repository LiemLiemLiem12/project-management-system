import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  currentTask: null,

  setCurrentTask: (id: string) => set({ currentTask: id }),
}));
