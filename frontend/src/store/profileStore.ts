// Store kiểu Zustand — sau này replace bằng: import { create } from 'zustand'

export interface WorkedOnItem {
  id: string;
  icon: "bolt" | "document" | "code" | "star";
  iconColor: string;
  title: string;
  project: string;
  collaborators: string; // e.g. "You and Trần Thanh Liêm have both worked on this"
}

export interface UserProfile {
  name: string;
  initials: string;
  avatarUrl: string | null; // null = dùng initials
  coverUrl: string | null;
  jobTitle: string;
  department: string;
  organization: string;
  location: string;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

export const profile: UserProfile = {
  name: "Na Ha",
  initials: "NH",
  avatarUrl: null,
  coverUrl: null,
  jobTitle: "",
  department: "",
  organization: "",
  location: "",
};

export const workedOnItems: WorkedOnItem[] = [
  {
    id: "w1",
    icon: "bolt",
    iconColor: "#A855F7",
    title: "Thực hiện Frontend",
    project: "Dự án CNTT",
    collaborators: "You and Trần Thanh Liêm have both worked on this",
  },
  {
    id: "w2",
    icon: "code",
    iconColor: "#3B82F6",
    title: "API Integration Sprint",
    project: "Dự án CNTT",
    collaborators: "You and Marcus Wright have both worked on this",
  },
  {
    id: "w3",
    icon: "document",
    iconColor: "#10B981",
    title: "Design System Documentation",
    project: "Design Platform",
    collaborators: "You and Sarah Chen have both worked on this",
  },
];
