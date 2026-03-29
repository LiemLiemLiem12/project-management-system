import { tasks } from "@/store/Store";

export default function TaskFooter({ visibleCount }: { visibleCount: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
      <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2v12M2 8h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Create
      </button>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>
          {visibleCount} of {tasks.length}
        </span>
        <button className="p-1 rounded hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.5 0 2.9.6 3.9 1.6L14 6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M14 2v4h-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
