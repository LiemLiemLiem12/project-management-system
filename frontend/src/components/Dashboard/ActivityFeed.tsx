import { activities, ActivityItem } from "@/store/Store";

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ item }: { item: ActivityItem }) {
  const colors: Record<ActivityItem["action"], string> = {
    commented: "bg-gray-200 text-gray-600",
    completed: "bg-green-100 text-green-600",
    created: "bg-blue-100 text-blue-600",
  };

  const icons: Record<ActivityItem["action"], string> = {
    commented: "💬",
    completed: "✓",
    created: "✏️",
  };

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${colors[item.action]}`}
    >
      {item.actorAvatar ?? icons[item.action]}
    </div>
  );
}

// ─── ActivityRow ──────────────────────────────────────────────
function ActivityRow({ id }: { id: string }) {
  const item = activities.find((a) => a.id === id)!;

  const actionText: Record<ActivityItem["action"], string> = {
    commented: "commented on",
    completed: "completed",
    created: "created a new task",
  };

  return (
    <div className="flex gap-3 py-4 border-b border-gray-50 last:border-0">
      <Avatar item={item} />
      <div className="min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{item.actor}</span>{" "}
          {actionText[item.action]}{" "}
          <a
            href={item.targetHref}
            className="text-blue-500 hover:underline font-medium"
          >
            {item.targetLabel}
          </a>
        </p>
        {item.preview && (
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {item.preview}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
      </div>
    </div>
  );
}

// ─── ActivityFeed ─────────────────────────────────────────────
export default function ActivityFeed() {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        {"What's Next"}
      </h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 divide-y divide-gray-50">
          {activities.map((a) => (
            <ActivityRow key={a.id} id={a.id} />
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <button className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 tracking-widest uppercase transition-colors">
            Load More Activity
          </button>
        </div>
      </div>
    </section>
  );
}
