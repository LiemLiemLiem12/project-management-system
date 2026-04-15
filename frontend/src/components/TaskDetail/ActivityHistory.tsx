import { ArrowRight } from "lucide-react";

const MOCK_HISTORY = [
  {
    id: "h1",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    action: "updated the Rank",
    time: "4 days ago",
    detail: { from: "None", to: "Ranked lower" },
  },
  {
    id: "h2",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    action: "changed the Status",
    time: "4 days ago",
    detail: { from: "TO DO", to: "PROGRESS", isTag: true },
  },
  {
    id: "h3",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    action: "changed the Parent",
    time: "April 4, 2026 at 1:23 AM",
    detail: { from: "None", to: "DC-42" },
  },
  {
    id: "h4",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    action: "updated the Labels",
    time: "April 4, 2026 at 1:23 AM",
    detail: { from: "None", to: "Code_BE" },
  },
  {
    id: "h5",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    action: "changed the Assignee",
    time: "April 4, 2026 at 1:23 AM",
    detail: { from: "Unassigned", to: "Trần Thanh Liêm", toAvatar: "TL" },
  },
];

export default function ActivityHistory() {
  return (
    <div className="space-y-6">
      {MOCK_HISTORY.map((item) => (
        <div key={item.id} className="flex gap-3">
          {/* <Avatar initials={item.avatar} /> */}
          <div className="flex-1">
            <div className="flex items-baseline gap-1 mb-0.5">
              <span className="font-semibold text-[#172B4D]">
                {item.author}
              </span>
              <span className="text-[#172B4D]">{item.action}</span>
            </div>
            <div className="text-xs text-slate-500 mb-2">{item.time}</div>

            <div className="flex items-center gap-2 text-sm text-[#172B4D]">
              {item.detail.from}
              <ArrowRight size={14} className="text-slate-400" />
              {/* {item.detail.toAvatar && (
                <Avatar
                  initials={item.detail.toAvatar}
                  className="w-5 h-5 text-[10px]"
                />
              )} */}
              {item.detail.isTag ? (
                <span className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold uppercase bg-slate-50 text-slate-600">
                  {item.detail.to}
                </span>
              ) : (
                <span>{item.detail.to}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
