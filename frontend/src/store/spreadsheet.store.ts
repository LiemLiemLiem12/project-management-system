// spStore.ts — không còn mock data, tất cả lấy từ task.store (groups)
import { useTaskStore } from "@/store/task.store";
import { GroupTask, Task as ApiTask } from "@/API/task.api";

// ─── Types (giữ nguyên để các component cũ không cần sửa) ────────────────────

export type GroupKey = string;

export type Task = {
  id: string;
  name: string;
  taskCode: string;
  assigneeIds: string[];
  reporterId: string;
  status: GroupKey;
  startDate: string; // <-- ĐÃ SỬA THÀNH startDate
  dueDate: string;
};

export type Assignee = {
  id: string;
  initials: string;
  color: string;
  textColor: string;
  name: string;
};

// ─── Helpers map màu cho assignee ─────────────────────────────────────────────

const COLORS = [
  { color: "#6366f1", textColor: "#fff" },
  { color: "#f59e0b", textColor: "#fff" },
  { color: "#10b981", textColor: "#fff" },
  { color: "#ef4444", textColor: "#fff" },
  { color: "#8b5cf6", textColor: "#fff" },
  { color: "#ec4899", textColor: "#fff" },
  { color: "#14b8a6", textColor: "#fff" },
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsFromId(id: string) {
  return id.slice(0, 2).toUpperCase();
}

export function makeAssignee(userId: string): Assignee {
  const c = colorForId(userId);
  return {
    id: userId,
    initials: initialsFromId(userId),
    name: userId,
    ...c,
  };
}

// ─── Map ApiTask → Task (spreadsheet format) ──────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function mapApiTaskToTask(apiTask: ApiTask): Task {
  // Ép kiểu sang any để lấy thoải mái không sợ TypeScript bắt lỗi
  const anyTask = apiTask as any;

  // Bao lô bắt mọi loại tên biến từ Backend (snake_case hoặc camelCase)
  const rawAssignee = anyTask.assignee_id || anyTask.assigneeId;
  const rawReporter = anyTask.created_by || anyTask.createdBy;
  const rawStatus = anyTask.group_task_id || anyTask.groupTaskId;
  const rawDueDate = anyTask.due_date || anyTask.dueDate;
  const rawStartDate = anyTask.start_date || anyTask.startDate; // <-- BẮT LẤY START DATE TỪ API

  return {
    id: anyTask.id,
    name: anyTask.title,
    taskCode: anyTask.id.slice(0, 8).toUpperCase(),

    // Nếu có ID thì bỏ vào mảng, không thì mảng rỗng
    assigneeIds: rawAssignee ? [rawAssignee] : [],

    reporterId: rawReporter || "",
    status: rawStatus || "",
    startDate: rawStartDate ? formatDate(rawStartDate) : "—", // <-- ĐƯA START DATE LÊN UI
    dueDate: formatDate(rawDueDate),
  };
}

// ─── Selectors (dùng trong component thay vì getTasks() mock) ─────────────────

/** Lấy flat list tất cả tasks từ store */
export function useSpTasks(): Task[] {
  const groups = useTaskStore((s) => s.groups);
  return groups.flatMap((g) => g.tasks.map(mapApiTaskToTask));
}

/** Lấy tasks theo group_task_id */
export function useSpTasksByGroup(groupId: string): Task[] {
  const groups = useTaskStore((s) => s.groups);
  const group = groups.find((g) => g.id === groupId);
  return (group?.tasks ?? []).map(mapApiTaskToTask);
}

/** Groups dưới dạng { key, label, isSuccess } để render TaskGroupSection */
export function useSpGroups() {
  const groups = useTaskStore((s) => s.groups);
  return groups.map((g) => ({
    key: g.id,
    label: g.title.toUpperCase(),
    isSuccess: g.isSuccess,
  }));
}

/** Lấy assignee info từ user_id */
export function useAssignee(userId?: string): Assignee | null {
  if (!userId) return null;
  return makeAssignee(userId);
}

/** Badge style theo isSuccess */
export function getGroupStyle(groupId: string): { bg: string; text: string } {
  const groups = useTaskStore.getState().groups;
  const group = groups.find((g) => g.id === groupId);
  if (!group) return { bg: "#F3F4F6", text: "#6B7280" };
  if (group.isSuccess) return { bg: "#DCFCE7", text: "#166534" };
  if (group.order === 0) return { bg: "#FEF3C7", text: "#92400E" };
  return { bg: "#FEF9C3", text: "#854D0E" };
}
