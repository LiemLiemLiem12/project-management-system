"use client";

import { useTaskStore } from "@/store/task.store";
import { useProjectStore } from "@/store/project.store";

export type ViewMode = "Weeks" | "Months" | "Quarters";
export type Priority = "Urgent" | "High" | "Normal" | "Low";

export interface TimelineTask {
  id: string;
  title: string;
  color: string;
  textColor: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  members?: string[];
  attachments?: number;
  status?: string;
  timeLabel?: string;
  priority?: Priority;
}

export interface TimelineGroup {
  id: string;
  name: string;
  color: string;
  tasks: TimelineTask[];
}

// ─── Helpers (giữ nguyên) ─────────────────────────────────────

export function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function isWeekend(d: Date) {
  return d.getDay() === 0 || d.getDay() === 6;
}
export function isToday(d: Date) {
  return isSameDay(d, new Date());
}
export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1));
  return r;
}
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1);
}
export function formatDateLabel(d: Date, mode: ViewMode): string {
  if (mode === "Weeks")
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (mode === "Months")
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}
export function getDaysInRange(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

// ─── Color palette cho group ──────────────────────────────────

const GROUP_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
];

function groupColor(index: number) {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

// ─── Format date ──────────────────────────────────────────────

function fmt(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Selector: map task.store.groups → TimelineGroup[] ───────

export function useTimelineGroups(): TimelineGroup[] {
  const groups = useTaskStore((s) => s.groups);
  const members = useProjectStore((s) => s.members);

  // Map user_id → full_name để hiển thị initials đúng
  const memberMap = Object.fromEntries(
    members.map((m) => [m.user_id, m.full_name || m.user_id]),
  );

  return groups.map((group, gi) => ({
    id: group.id,
    name: group.title,
    color: groupColor(gi),
    tasks: group.tasks
      .filter((t) => !t.is_archived)
      .map((task) => {
        // startDate: dùng start_date nếu có, fallback về due_date hoặc hôm nay
        const startDate = task.start_date
          ? fmt(new Date(task.start_date))
          : task.due_date
            ? fmt(new Date(task.due_date))
            : fmt(new Date());

        // endDate: dùng due_date nếu có, fallback về startDate
        const endDate = task.due_date
          ? fmt(new Date(task.due_date))
          : startDate;

        // Assignee initials
        const assigneeName = task.assignee_id
          ? memberMap[task.assignee_id] || task.assignee_id
          : null;
        const initials = assigneeName
          ? assigneeName
              .trim()
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : null;

        // Label màu đầu tiên làm màu bar, fallback theo group
        const barColor = task.labels?.[0]?.color_code ?? groupColor(gi);
        const isLight = isLightColor(barColor);

        return {
          id: task.id,
          title: task.title,
          color: barColor,
          textColor: isLight ? "#374151" : "#FFFFFF",
          startDate,
          endDate,
          members: initials ? [initials] : [],
          status: group.title.toUpperCase(),
        } satisfies TimelineTask;
      }),
  }));
}

// ─── Helper kiểm tra màu sáng/tối ────────────────────────────

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Luminance formula
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
