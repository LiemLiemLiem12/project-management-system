import { workedOnItems, WorkedOnItem } from "@/store/profileStore";

// ─── Icon map ─────────────────────────────────────────────────
function ItemIcon({ type, color }: { type: WorkedOnItem["icon"]; color: string }) {
  const icons: Record<WorkedOnItem["icon"], React.ReactNode> = {
    bolt: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M11 2L4 11h7l-2 7 9-10h-7l2-6z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
    document: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M4 3h8l4 4v11H4V3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12 3v4h4M7 10h6M7 13h4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    code: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M7 6l-4 4 4 4M13 6l4 4-4 4M11 4l-2 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    star: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.4 5 5.6.5-4 3.8 1.2 5.5L10 14l-5.2 2.8 1.2-5.5L2 7.5l5.6-.5L10 2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  };
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18` }}
    >
      {icons[type]}
    </div>
  );
}

// ─── Single worked-on row ─────────────────────────────────────
function WorkedOnRow({ item }: { item: WorkedOnItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded-lg px-2 -mx-2 transition-colors cursor-pointer group">
      <ItemIcon type={item.icon} color={item.iconColor} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {item.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          <span className="font-medium text-gray-600">{item.project}</span>
          {" · "}
          {item.collaborators}
        </p>
      </div>
    </div>
  );
}

// ─── WorkedOn section ─────────────────────────────────────────
export default function WorkedOnSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Worked on</h2>
          <p className="text-xs text-gray-400 mt-0.5">Others will only see what they can access.</p>
        </div>
        <button className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors">
          View all
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl px-4 py-1 mt-3">
        {workedOnItems.map((item) => (
          <WorkedOnRow key={item.id} item={item} />
        ))}
        <div className="py-3">
          <button className="text-sm text-gray-500 hover:text-blue-500 font-medium transition-colors">
            View all
          </button>
        </div>
      </div>
    </div>
  );
}
