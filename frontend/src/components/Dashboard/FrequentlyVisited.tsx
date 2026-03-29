import { spaces } from "@/store/Store";

// ─── Icon components ──────────────────────────────────────────
function JiraIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
      <rect width="32" height="32" rx="6" fill="#E8F0FE" />
      <path d="M16 7l-9 9 5 5 4-4 4 4 5-5-9-9z" fill="#4C6EF5" />
      <path d="M16 18l-4 4 4 4 4-4-4-4z" fill="#7C9CF7" />
    </svg>
  );
}

function TrelloIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
      <rect width="32" height="32" rx="6" fill="#E6F9F4" />
      <rect x="8" y="8" width="6" height="14" rx="2" fill="#34C38F" />
      <rect x="18" y="8" width="6" height="9" rx="2" fill="#34C38F" />
    </svg>
  );
}

function ConfluenceIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
      <rect width="32" height="32" rx="6" fill="#EEF2FF" />
      <path
        d="M8 22c4-6 8-9 16-9"
        stroke="#6366F1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 10c-4 6-8 9-16 9"
        stroke="#818CF8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const iconMap = {
  jira: JiraIcon,
  trello: TrelloIcon,
  confluence: ConfluenceIcon,
} as const;

// ─── SpaceCard ───────────────────────────────────────────────
function SpaceCard({ id }: { id: string }) {
  const space = spaces.find((s) => s.id === id)!;
  const Icon = iconMap[space.icon];

  return (
    <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer p-5 group">
      <div className="mb-4">
        <Icon />
      </div>
      <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
        {space.name}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{space.subtitle}</p>
    </div>
  );
}

// ─── FrequentlyVisited ───────────────────────────────────────
export default function FrequentlyVisited() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Frequently Visited
        </h2>
        <button className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
          View all spaces
        </button>
      </div>
      <div className="flex gap-4">
        {spaces.map((space) => (
          <SpaceCard key={space.id} id={space.id} />
        ))}
      </div>
    </section>
  );
}
