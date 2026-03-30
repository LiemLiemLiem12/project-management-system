// Shared UI primitives — không nhận prop dữ liệu phức tạp,
// chỉ nhận id hoặc value đơn giản, tự lookup từ store

import { getAssignee, type Priority, type Status } from "@/store/Store";

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  assigneeId,
  size = 24,
  className = "",
}: {
  assigneeId: string;
  size?: number;
  className?: string;
}) {
  const a = getAssignee(assigneeId);
  if (!a) return null;
  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium flex-shrink-0 border-2 border-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: a.color,
        color: a.textColor,
      }}
    >
      {a.initials}
    </div>
  );
}

// ─── AvatarGroup ──────────────────────────────────────────────────────────────
export function AvatarGroup({ ids, max = 3 }: { ids: string[]; max?: number }) {
  const visible = ids.slice(0, max);
  const extra = ids.length - max;
  return (
    <div className="flex items-center">
      {visible.map((id, i) => (
        <div
          key={id}
          style={{ marginLeft: i === 0 ? 0 : -6, zIndex: visible.length - i }}
        >
          <Avatar assigneeId={id} size={24} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="rounded-full flex items-center justify-center text-[10px] font-medium bg-gray-100 text-gray-500 border-2 border-white flex-shrink-0"
          style={{ width: 24, height: 24, marginLeft: -6 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

// ─── Reporter Avatar ───────────────────────────────────────────────────────────
export function ReporterCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0"
        style={{
          width: 24,
          height: 24,
          background: "#312E81",
          color: "#C7D2FE",
        }}
      >
        DV
      </div>
      <span className="text-sm text-gray-800 hidden sm:inline">{name}</span>
    </div>
  );
}

// ─── PriorityBadge ────────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<
  Priority,
  { bg: string; text: string; border: string; flag: string }
> = {
  Urgent: {
    bg: "#FFF7ED",
    text: "#C2410C",
    border: "#FED7AA",
    flag: "#EF4444",
  },
  High: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", flag: "#F59E0B" },
  Normal: {
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    flag: "#22C55E",
  },
  Low: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", flag: "#3B82F6" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer select-none whitespace-nowrap"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {/* Flag icon */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        className="flex-shrink-0"
      >
        <path
          d="M2 10V2h7l-2 3 2 3H2"
          stroke={s.flag}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden xs:inline">{priority}</span>
      {/* Chevron */}
      <svg
        width="9"
        height="9"
        viewBox="0 0 10 10"
        fill="none"
        className="flex-shrink-0 opacity-50"
      >
        <path
          d="M2 3.5l3 3 3-3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<
  Status,
  { bg: string; text: string; border: string }
> = {
  "To-Do": { bg: "#F8FAFC", text: "#374151", border: "#D1D5DB" },
  "In Progress": { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  Done: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
};

export function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer select-none whitespace-nowrap"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span className="hidden xs:inline">{status}</span>
      {status === "Done" ? (
        <span
          className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
          style={{ borderColor: "#16a34a" }}
        >
          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4l3 3 5-5"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          fill="none"
          className="flex-shrink-0 opacity-50"
        >
          <path
            d="M2 3.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

// ─── TaskCheckbox ─────────────────────────────────────────────────────────────
export function TaskCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
      style={{
        borderColor: checked ? "#4F46E5" : "#D1D5DB",
        background: checked ? "#4F46E5" : "transparent",
      }}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
