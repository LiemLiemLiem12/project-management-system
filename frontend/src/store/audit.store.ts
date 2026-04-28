import { create } from "zustand";

interface AuditState {
  activities: any[];
  groupedActivities: Record<string, any[]>;
  isLoading: boolean;
  error: string | null;
  setActivitiesData: (
    activities: any[],
    groupedActivities: Record<string, any[]>,
  ) => void;
  setLoading: (status: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  activities: [],
  groupedActivities: {},
  isLoading: true,
  error: null,

  setActivitiesData: (activities, groupedActivities) =>
    set({ activities, groupedActivities, isLoading: false, error: null }),

  setLoading: (status) => set({ isLoading: status }),
  setError: (msg) => set({ error: msg, isLoading: false }),
}));
