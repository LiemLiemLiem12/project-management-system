"use client";

import { StorageFile, ViewMode } from "@/store/storageStore";

// ─── Folder icon ──────────────────────────────────────────────
function FolderIcon() {
  return (
    <svg viewBox="0 0 80 60" className="w-full h-full" fill="none">
      <path d="M4 12C4 9.8 5.8 8 8 8h20l6 8h38a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V12z" fill="#F59E0B"/>
      <path d="M4 20h72v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V20z" fill="#FBBF24"/>
      {/* folder tab decoration */}
      <rect x="20" y="44" width="12" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
      <rect x="36" y="44" width="12" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

// ─── Doc thumbnail ────────────────────────────────────────────
function DocThumbnail() {
  return (
    <div className="w-full h-full bg-white border border-gray-100 rounded-lg flex flex-col p-2 gap-1">
      {[80, 60, 70, 50, 65, 55].map((w, i) => (
        <div key={i} className="h-1.5 rounded-full bg-gray-200" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── Grid file card ───────────────────────────────────────────
function FileGridCard({
  file,
  selected,
  onClick,
}: {
  file: StorageFile;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group flex flex-col items-center gap-2 p-2 rounded-xl transition-all
        ${selected ? "ring-2 ring-blue-400 ring-offset-1 bg-blue-50/40" : "hover:bg-gray-50"}`}
    >
      {/* Thumbnail area */}
      <div className={`w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center
        ${selected ? "ring-2 ring-cyan-400" : ""}
        ${file.isFolder ? "p-3 bg-transparent" : "bg-gray-50"}`}
      >
        {file.isFolder ? (
          <FolderIcon />
        ) : file.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <DocThumbnail />
        )}
      </div>

      {/* Name */}
      <p className="text-xs font-medium text-gray-700 text-center truncate w-full px-1 leading-tight">
        {file.name}
      </p>
    </div>
  );
}

// ─── List file row ────────────────────────────────────────────
function FileListRow({
  file,
  selected,
  onClick,
}: {
  file: StorageFile;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${selected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"}`}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
        {file.isFolder
          ? <FolderIcon />
          : file.thumbnail
            ? <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />  // eslint-disable-line @next/next/no-img-element
            : <DocThumbnail />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{file.size} · {file.modifiedAt}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}

// ─── FileGrid ─────────────────────────────────────────────────
export default function FileGrid({
  files,
  viewMode,
  selectedId,
  onSelect,
}: {
  files: StorageFile[];
  viewMode: ViewMode;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {files.map(f => (
          <FileGridCard
            key={f.id}
            file={f}
            selected={f.id === selectedId}
            onClick={() => onSelect(f.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {files.map(f => (
        <FileListRow
          key={f.id}
          file={f}
          selected={f.id === selectedId}
          onClick={() => onSelect(f.id)}
        />
      ))}
    </div>
  );
}
