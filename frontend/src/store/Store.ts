// Store dữ liệu kiểu Zustand — sau này replace bằng: import { create } from 'zustand'
// Hiện tại dùng plain object để bạn có thể dễ migrate

// ─── Types ────────────────────────────────────────────────────────────────────

export type TaskStatus = "DEVELOPMENT" | "MARKETING" | "ADMIN";
export type Priority = "Urgent" | "High" | "Normal" | "Low";
export type Status = "To-Do" | "In Progress" | "Done";
export type GroupKey = "todo" | "inprog" | "done";

export interface Assignee {
  id: string;
  initials: string;
  color: string;
  textColor: string;
}

export interface Task {
  id: string;
  taskCode: string; // e.g. "T2003 | 120120" — dùng cho taskboard
  name: string; // tên task đầy đủ
  title: string; // alias ngắn — dùng cho sidebar MyTasks
  tag: TaskStatus; // badge DEVELOPMENT / MARKETING / ADMIN
  assigneeIds: string[];
  reporterId: string;
  priority: Priority;
  status: Status;
  group: GroupKey;
  createdDate: string;
  dueDate: string;
  due: string; // hiển thị thân thiện, e.g. "Today", "In 2 days"
  urgent?: boolean;
  completed: boolean;
}

export interface Space {
  id: string;
  name: string;
  subtitle: string;
  icon: "jira" | "trello" | "confluence";
}

export interface ActivityItem {
  id: string;
  actor: string;
  actorAvatar?: string;
  action: "commented" | "completed" | "created";
  targetLabel: string;
  targetHref: string;
  preview?: string;
  timestamp: string;
}

export interface ProjectDeadline {
  label: string;
  daysLeft: number;
  progress: number; // 0–100
}

export interface TaskGroup {
  key: GroupKey;
  label: string;
  collapsed: boolean;
}

// ─── Assignees ────────────────────────────────────────────────────────────────

export const assignees: Assignee[] = [
  { id: "dv", initials: "DV", color: "#E0E7FF", textColor: "#3730A3" },
  { id: "sc", initials: "SC", color: "#FCE7F3", textColor: "#9D174D" },
  { id: "mw", initials: "MW", color: "#D1FAE5", textColor: "#065F46" },
  { id: "jl", initials: "JL", color: "#FEF3C7", textColor: "#92400E" },
  { id: "rep", initials: "DV", color: "#312E81", textColor: "#C7D2FE" }, // reporter style
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks: Task[] = [
  // ── Dashboard sidebar tasks (group: "todo", tag-based) ──
  {
    id: "t1",
    taskCode: "T2003 | 120120",
    name: "Review PR for dashboard auth",
    title: "Review PR for dashboard auth",
    tag: "DEVELOPMENT",
    assigneeIds: ["dv"],
    reporterId: "rep",
    priority: "Urgent",
    status: "To-Do",
    group: "todo",
    createdDate: "Apr 11, 2024",
    dueDate: "Jun 11, 2024",
    due: "Today",
    urgent: true,
    completed: false,
  },
  {
    id: "t2",
    taskCode: "T2007 | 120145",
    name: "Prepare for Weekly Sync",
    title: "Prepare for Weekly Sync",
    tag: "MARKETING",
    assigneeIds: ["sc"],
    reporterId: "rep",
    priority: "Normal",
    status: "To-Do",
    group: "todo",
    createdDate: "Apr 12, 2024",
    dueDate: "Jun 20, 2024",
    due: "In 2 days",
    completed: false,
  },
  {
    id: "t3",
    taskCode: "T2001 | 120100",
    name: "Update Q3 Financials",
    title: "Update Q3 Financials",
    tag: "ADMIN",
    assigneeIds: ["mw", "dv"],
    reporterId: "rep",
    priority: "Normal",
    status: "To-Do",
    group: "todo",
    createdDate: "Apr 09, 2024",
    dueDate: "May 30, 2024",
    due: "Jul 24",
    completed: false,
  },
  {
    id: "t4",
    taskCode: "T2009 | 120190",
    name: "Brand guidelines approval",
    title: "Brand guidelines approval",
    tag: "MARKETING",
    assigneeIds: ["jl"],
    reporterId: "rep",
    priority: "Low",
    status: "To-Do",
    group: "todo",
    createdDate: "Apr 18, 2024",
    dueDate: "Jul 05, 2024",
    due: "Aug 01",
    completed: false,
  },

  // ── Taskboard — IN PROGRESS ──
  {
    id: "t5",
    taskCode: "T2003 | 120170",
    name: "Project Outer Test Phase",
    title: "Project Outer Test Phase",
    tag: "DEVELOPMENT",
    assigneeIds: ["sc", "mw"],
    reporterId: "rep",
    priority: "Normal",
    status: "In Progress",
    group: "inprog",
    createdDate: "Apr 15, 2024",
    dueDate: "Jan 17, 2024",
    due: "Jan 17, 2024",
    completed: false,
  },
  {
    id: "t6",
    taskCode: "T2008 | 120850",
    name: "API Integration Module",
    title: "API Integration Module",
    tag: "DEVELOPMENT",
    assigneeIds: ["dv"],
    reporterId: "rep",
    priority: "High",
    status: "In Progress",
    group: "inprog",
    createdDate: "May 02, 2024",
    dueDate: "May 10, 2024",
    due: "May 10, 2024",
    completed: false,
  },
  {
    id: "t7",
    taskCode: "T2011 | 120900",
    name: "Performance Optimization",
    title: "Performance Optimization",
    tag: "DEVELOPMENT",
    assigneeIds: ["mw", "dv"],
    reporterId: "rep",
    priority: "Urgent",
    status: "In Progress",
    group: "inprog",
    createdDate: "May 05, 2024",
    dueDate: "May 25, 2024",
    due: "May 25, 2024",
    completed: false,
  },

  // ── Taskboard — DONE ──
  {
    id: "t8",
    taskCode: "T2005 | 120730",
    name: "Collaborarization API",
    title: "Collaborarization API",
    tag: "DEVELOPMENT",
    assigneeIds: ["dv"],
    reporterId: "rep",
    priority: "Low",
    status: "Done",
    group: "done",
    createdDate: "Jan 12, 2024",
    dueDate: "Jan 17, 2024",
    due: "Jan 17, 2024",
    completed: true,
  },
  {
    id: "t9",
    taskCode: "T2002 | 120110",
    name: "Authentication Module",
    title: "Authentication Module",
    tag: "DEVELOPMENT",
    assigneeIds: ["sc", "dv"],
    reporterId: "rep",
    priority: "High",
    status: "Done",
    group: "done",
    createdDate: "Jan 05, 2024",
    dueDate: "Feb 01, 2024",
    due: "Feb 01, 2024",
    completed: true,
  },
  {
    id: "t10",
    taskCode: "T2004 | 120500",
    name: "Landing Page Redesign",
    title: "Landing Page Redesign",
    tag: "MARKETING",
    assigneeIds: ["mw"],
    reporterId: "rep",
    priority: "Normal",
    status: "Done",
    group: "done",
    createdDate: "Feb 10, 2024",
    dueDate: "Mar 01, 2024",
    due: "Mar 01, 2024",
    completed: true,
  },
  {
    id: "t11",
    taskCode: "T2006 | 120600",
    name: "Database Schema Migration",
    title: "Database Schema Migration",
    tag: "DEVELOPMENT",
    assigneeIds: ["dv", "sc"],
    reporterId: "rep",
    priority: "Urgent",
    status: "Done",
    group: "done",
    createdDate: "Feb 20, 2024",
    dueDate: "Mar 15, 2024",
    due: "Mar 15, 2024",
    completed: true,
  },
  {
    id: "t12",
    taskCode: "T2010 | 120800",
    name: "CI/CD Pipeline Setup",
    title: "CI/CD Pipeline Setup",
    tag: "DEVELOPMENT",
    assigneeIds: ["mw", "dv"],
    reporterId: "rep",
    priority: "Normal",
    status: "Done",
    group: "done",
    createdDate: "Mar 01, 2024",
    dueDate: "Mar 30, 2024",
    due: "Mar 30, 2024",
    completed: true,
  },
  {
    id: "t13",
    taskCode: "T2012 | 120950",
    name: "Security Audit Report",
    title: "Security Audit Report",
    tag: "DEVELOPMENT",
    assigneeIds: ["dv"],
    reporterId: "rep",
    priority: "High",
    status: "Done",
    group: "done",
    createdDate: "Mar 10, 2024",
    dueDate: "Apr 05, 2024",
    due: "Apr 05, 2024",
    completed: true,
  },
];

// ─── Spaces ───────────────────────────────────────────────────────────────────

export const spaces: Space[] = [
  {
    id: "s1",
    name: "Jira Software",
    subtitle: "Engineering Kanban • Active",
    icon: "jira",
  },
  {
    id: "s2",
    name: "Trello Board",
    subtitle: "Marketing Ops • Updated 2h ago",
    icon: "trello",
  },
  {
    id: "s3",
    name: "Confluence Docs",
    subtitle: "Design System • 3 new comments",
    icon: "confluence",
  },
];

// ─── Activity ─────────────────────────────────────────────────────────────────

export const activities: ActivityItem[] = [
  {
    id: "a1",
    actor: "Sarah Chen",
    action: "commented",
    targetLabel: "Finalize Landing Page",
    targetHref: "#",
    preview: '"I\'ve updated the brand assets, take a look when you can!"',
    timestamp: "12 minutes ago",
  },
  {
    id: "a2",
    actor: "Marcus Wright",
    actorAvatar: "MW",
    action: "completed",
    targetLabel: "API Documentation v2",
    targetHref: "#",
    timestamp: "2 hours ago",
  },
  {
    id: "a3",
    actor: "Jordan Lee",
    actorAvatar: "JL",
    action: "created",
    targetLabel: "Research competitor UI patterns",
    targetHref: "#",
    timestamp: "Yesterday at 4:30 PM",
  },
];

// ─── Project & User ───────────────────────────────────────────────────────────

export const projectDeadline: ProjectDeadline = {
  label: "Project 1",
  daysLeft: 14,
  progress: 75,
};

export const user = {
  name: "Alex",
  taskCount: 4,
  projectCount: 2,
};

export const taskGroups: TaskGroup[] = [
  { key: "todo", label: "TO-DO", collapsed: false },
  { key: "inprog", label: "IN PROGRESS", collapsed: false },
  { key: "done", label: "DONE", collapsed: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAssignee(id: string): Assignee | undefined {
  return assignees.find((a) => a.id === id);
}

export function getTasksByGroup(groupKey: GroupKey): Task[] {
  return tasks.filter((t) => t.group === groupKey);
}

/** Lấy tasks hiển thị ở sidebar MyTasks (chỉ group todo) */
export function getSidebarTasks(): Task[] {
  return tasks.filter((t) => t.group === "todo");
}
