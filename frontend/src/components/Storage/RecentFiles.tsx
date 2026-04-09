import { recentFiles, StorageFile } from "@/store/storageStore";

function FileTypeIcon({ type }: { type: StorageFile["type"] }) {
  if (type === "document") {
    return (
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-gray-400">{type.toUpperCase().slice(0,3)}</span>
    </div>
  );
}

// Detect file format for icon color
function getDocStyle(name: string): { bg: string; color: string; label: string } {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf")  return { bg: "#FEF2F2", color: "#EF4444", label: "PDF" };
  if (ext === "ppt" || ext === "pptx") return { bg: "#FFF7ED", color: "#F97316", label: "PPT" };
  return { bg: "#EFF6FF", color: "#3B82F6", label: "DOC" };
}

function RecentFileCard({ file }: { file: StorageFile }) {
  const style = getDocStyle(file.name);
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group min-w-0 flex-1">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
        style={{ background: style.bg, color: style.color }}>
        {style.label}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{file.size} · {file.type.charAt(0).toUpperCase() + file.type.slice(1)}</p>
      </div>
      {/* Menu */}
      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}

export default function RecentFiles() {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Recently Modified</h2>
        <button className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">View All</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recentFiles.map(f => <RecentFileCard key={f.id} file={f} />)}
      </div>
    </section>
  );
}
