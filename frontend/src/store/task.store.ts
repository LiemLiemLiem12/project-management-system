import { create } from "zustand";
import { GroupTask, Task } from "@/API/task.api";

// 1. Khai báo kho chứa tất cả State và Action
interface TaskState {
  // ─── Phần Kanban Board (Mới) ───
  groups: GroupTask[];
  isLoading: boolean;
  error: string | null;

  setGroups: (groups: GroupTask[]) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;

  optimisticMoveTask: (params: {
    taskId: string;
    fromGroupId: string;
    toGroupId: string;
    fromIndex: number;
    toIndex: number;
  }) => void;

  optimisticReorderGroups: (ordered_ids: string[]) => void;
  appendGroup: (group: GroupTask) => void;
  appendTask: (groupId: string, task: Task) => void;

  // ─── Phần Current Task (Cũ - Giữ y nguyên) ───
  currentTask: string | null;
  setCurrentTask: (id: string) => void;
}

// 2. Triển khai kho dữ liệu
export const useTaskStore = create<TaskState>((set, get) => ({
  // ─── Khởi tạo State ban đầu ───
  groups: [],
  isLoading: false,
  error: null,

  currentTask: null, // Của store cũ

  // ─── Các hàm cập nhật State ───
  setGroups: (groups) => set({ groups }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (v) => set({ error: v }),

  optimisticMoveTask: ({
    taskId,
    fromGroupId,
    toGroupId,
    fromIndex,
    toIndex,
  }) => {
    set((s) => {
      const groups = s.groups.map((g) => ({ ...g, tasks: [...g.tasks] }));
      const from = groups.find((g) => g.id === fromGroupId)!;
      const to = groups.find((g) => g.id === toGroupId)!;

      const [moved] = from.tasks.splice(fromIndex, 1);

      if (fromGroupId === toGroupId) {
        from.tasks.splice(toIndex, 0, moved);
      } else {
        to.tasks.splice(toIndex, 0, { ...moved, group_task_id: toGroupId });
      }

      return { groups };
    });
  },

  optimisticReorderGroups: (ordered_ids) => {
    set((s) => {
      const map = Object.fromEntries(s.groups.map((g) => [g.id, g]));
      return {
        groups: ordered_ids.map((id, i) => ({ ...map[id], order: i })),
      };
    });
  },

  appendGroup: (group) => {
    set((s) => ({ groups: [...s.groups, { ...group, tasks: [] }] }));
  },

  appendTask: (groupId, task) => {
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === groupId ? { ...g, tasks: [...g.tasks, task] } : g,
      ),
    }));
  },

  // ─── Hàm của store cũ (Giữ y nguyên) ───
  setCurrentTask: (id: string) => set({ currentTask: id }),
}));
