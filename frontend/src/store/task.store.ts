import { create } from "zustand";
import { GroupTask, Task } from "@/API/task.api";

// 1. Khai báo 1 interface duy nhất chứa TẤT CẢ State và Action
interface TaskStoreState {
  // ─── Phần My Tasks (Trang For You) ───
  myTasks: any[];
  setMyTasks: (tasks: any[]) => void;

  // ─── Phần Kanban Board ───
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

  // ─── Phần Current Task ───
  currentTask: any;
  setCurrentTask: (task: any) => void;
}

// 2. Triển khai kho dữ liệu duy nhất
export const useTaskStore = create<TaskStoreState>((set) => ({
  // ─── Khởi tạo State ban đầu ───
  myTasks: [],
  groups: [],
  isLoading: false,
  error: null,
  currentTask: null,

  // ─── Các hàm cập nhật State chung ───
  setMyTasks: (tasks) => set({ myTasks: tasks }),
  setGroups: (groups) => set({ groups }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (v) => set({ error: v }),

  // ─── Các hàm cập nhật UI cho Kanban ───
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

  // ─── Hàm của store cũ ───
  setCurrentTask: (task) => set({ currentTask: task }),
}));
