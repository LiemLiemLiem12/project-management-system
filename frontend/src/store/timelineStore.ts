// Store kiểu Zustand — sau này replace bằng: import { create } from 'zustand'

export type ViewMode = "Weeks" | "Months" | "Quarters";
export type Priority = "Urgent" | "High" | "Normal" | "Low";

export interface TimelineTask {
  id: string;
  title: string;
  color: string;
  textColor: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
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

// ─── Helpers ──────────────────────────────────────────────────
export function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}
export function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function isWeekend(d: Date) { return d.getDay() === 0 || d.getDay() === 6; }
export function isToday(d: Date) { return isSameDay(d, new Date()); }
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
  if (mode === "Weeks") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  if (mode === "Months") {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}
export function getDaysInRange(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

// ─── Sample data — tasks trong tuần hiện tại ─────────────────
const today = new Date();
const mon = startOfWeek(today);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

export const timelineGroups: TimelineGroup[] = [
  {
    id: "unscheduled",
    name: "Unscheduled Tasks",
    color: "#9CA3AF",
    tasks: [
      {
        id: "task-1",
        title: "Market Research Doc",
        color: "#F3F4F6",
        textColor: "#374151",
        startDate: fmt(addDays(mon, 1)),
        endDate: fmt(addDays(mon, 1)),
        status: "DRAFTING",
        priority: "Normal",
      },
    ],
  },
  {
    id: "group-1",
    name: "Group 1",
    color: "#3B82F6",
    tasks: [
      {
        id: "task-2",
        title: "Frontend Architecture Review",
        color: "#3B82F6",
        textColor: "#FFFFFF",
        startDate: fmt(addDays(mon, 1)),
        endDate: fmt(addDays(mon, 3)),
        members: ["AV", "TL"],
        priority: "High",
      },
      {
        id: "task-5",
        title: "UI Component Library",
        color: "#6366F1",
        textColor: "#FFFFFF",
        startDate: fmt(addDays(mon, 4)),
        endDate: fmt(addDays(mon, 6)),
        members: ["AV"],
        priority: "Normal",
      },
    ],
  },
  {
    id: "group-2",
    name: "Group 2",
    color: "#9CA3AF",
    tasks: [
      {
        id: "task-3",
        title: "Q2 Review",
        color: "#D1FAE5",
        textColor: "#065F46",
        startDate: fmt(addDays(mon, 3)),
        endDate: fmt(addDays(mon, 3)),
        timeLabel: "2:00 PM - 3:30 PM",
        priority: "Urgent",
      },
      {
        id: "task-4",
        title: "AWS Migration Pipeline",
        color: "#F59E0B",
        textColor: "#FFFFFF",
        startDate: fmt(addDays(mon, 4)),
        endDate: fmt(addDays(mon, 6)),
        attachments: 3,
        priority: "High",
      },
    ],
  },
  {
    id: "group-3",
    name: "Group 3",
    color: "#10B981",
    tasks: [
      {
        id: "task-6",
        title: "Database Schema Migration",
        color: "#F97316",
        textColor: "#FFFFFF",
        startDate: fmt(addDays(mon, 0)),
        endDate: fmt(addDays(mon, 2)),
        attachments: 2,
        priority: "Urgent",
      },
    ],
  },
];
