// Store kiểu Zustand — sau này replace bằng:
// import { create } from 'zustand'
// const useStorageStore = create<StorageStore>((set, get) => ({ ...initialState, actions }))

export type FileType = "image" | "document" | "video" | "other";
export type ViewMode = "grid" | "list";

export interface StorageUser {
  id: string;
  initials: string;
  color: string;       // bg color
  name: string;
}

export interface StorageFile {
  id: string;
  name: string;
  type: FileType;
  size: string;        // "2.2 MB"
  sizeBytes: number;
  thumbnail?: string;  // URL or null → show doc icon
  isFolder: boolean;
  modifiedAt: string;  // "13 Mar 2022"
  modifiedBy: string;  // user id
  location: string;
  accessUserIds: string[];
}

export interface StorageStats {
  totalGB: number;
  usedGB: number;
  breakdown: { type: FileType | "other"; label: string; percent: number; color: string }[];
}

// ─── Users ────────────────────────────────────────────────────
export const users: StorageUser[] = [
  { id: "u1", initials: "SA", color: "#EF4444", name: "Furuya Rei" },
  { id: "u2", initials: "SA", color: "#3B82F6", name: "Alex Rivera" },
  { id: "u3", initials: "SA", color: "#10B981", name: "Jordan Lee" },
];

// ─── Stats ────────────────────────────────────────────────────
export const storageStats: StorageStats = {
  totalGB: 1000,
  usedGB: 650,
  breakdown: [
    { type: "image",    label: "Image",    percent: 17, color: "#22C55E" },
    { type: "document", label: "Document", percent: 13, color: "#F59E0B" },
    { type: "video",    label: "Video",    percent: 25, color: "#3B82F6" },
    { type: "other",    label: "Others",   percent: 10, color: "#EC4899" },
  ],
};

// ─── Recently modified files ───────────────────────────────────
export const recentFiles: StorageFile[] = [
  { id: "r1", name: "Event-Apr-2025.docx", type: "document", size: "2.2 MB", sizeBytes: 2200000, isFolder: false, modifiedAt: "Apr 01, 2025", modifiedBy: "u1", location: "Project Files", accessUserIds: ["u1","u2","u3"] },
  { id: "r2", name: "Contract-John.pdf",   type: "document", size: "2.2 MB", sizeBytes: 2200000, isFolder: false, modifiedAt: "Mar 28, 2025", modifiedBy: "u1", location: "Project Files", accessUserIds: ["u1","u2"] },
  { id: "r3", name: "Sharing-Week2.ppt",   type: "document", size: "2.2 MB", sizeBytes: 2200000, isFolder: false, modifiedAt: "Mar 20, 2025", modifiedBy: "u2", location: "Project Files", accessUserIds: ["u1","u2","u3"] },
  { id: "r4", name: "Briefing.docx",       type: "document", size: "2.2 MB", sizeBytes: 2200000, isFolder: false, modifiedAt: "Mar 15, 2025", modifiedBy: "u3", location: "Project Files", accessUserIds: ["u1"] },
];

// ─── Project storage files ────────────────────────────────────
const MOUNTAIN_IMG = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80";
const DOC_THUMB = null; // null = show doc icon

function makeDoc(id: string, selected = false): StorageFile {
  return {
    id, name: "Document.docx", type: "document", size: "1.8 MB", sizeBytes: 1800000,
    thumbnail: DOC_THUMB, isFolder: false,
    modifiedAt: "13 Mar 2022", modifiedBy: "u1",
    location: "Project Files", accessUserIds: ["u1","u2","u3"],
  };
}

function makeImg(id: string): StorageFile {
  return {
    id, name: "Story_board.jpg", type: "image", size: "1.2 MB", sizeBytes: 1200000,
    thumbnail: MOUNTAIN_IMG, isFolder: false,
    modifiedAt: "13 Mar 2022", modifiedBy: "u1",
    location: "Project Files", accessUserIds: ["u1","u2","u3"],
  };
}

export const projectFiles: StorageFile[] = [
  // Folders
  { id: "f1", name: "Creada Team",   type: "other", size: "—", sizeBytes: 0, thumbnail: undefined, isFolder: true,  modifiedAt: "01 Mar 2022", modifiedBy: "u1", location: "Project Files", accessUserIds: ["u1","u2","u3"] },
  { id: "f2", name: "Documentation", type: "other", size: "—", sizeBytes: 0, thumbnail: undefined, isFolder: true,  modifiedAt: "01 Mar 2022", modifiedBy: "u1", location: "Project Files", accessUserIds: ["u1","u2","u3"] },
  // Docs row 1
  makeDoc("d1"), makeDoc("d2"), makeDoc("d3"), makeDoc("d4"),
  // Docs row 2
  makeDoc("d5"), makeDoc("d6"), makeDoc("d7"), makeDoc("d8"), makeDoc("d9"),
  // Selected image
  { ...makeImg("img1"), id: "img-selected" },
  // Images
  makeImg("img2"), makeImg("img3"), makeImg("img4"),
  makeImg("img5"), makeImg("img6"), makeImg("img7"),
  makeImg("img8"), makeImg("img9"), makeImg("img10"),
  makeImg("img11"), makeImg("img12"), makeImg("img13"),
];

// ─── Helpers ──────────────────────────────────────────────────
export function getUser(id: string): StorageUser | undefined {
  return users.find(u => u.id === id);
}

export function getFileIcon(type: FileType): { color: string; label: string } {
  const map: Record<FileType, { color: string; label: string }> = {
    image:    { color: "#3B82F6", label: "IMG" },
    document: { color: "#EF4444", label: "DOC" },
    video:    { color: "#8B5CF6", label: "VID" },
    other:    { color: "#9CA3AF", label: "---" },
  };
  return map[type];
}
