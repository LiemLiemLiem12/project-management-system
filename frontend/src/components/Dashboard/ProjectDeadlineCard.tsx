import { projectDeadline } from "@/store/Store";

// ─── Circular progress ────────────────────────────────────────
function CircularProgress({ value }: { value: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative w-14 h-14">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={r}
          stroke="#E5E7EB"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          stroke="#6366F1"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-indigo-600">
        {value}%
      </span>
    </div>
  );
}

// ─── ProjectDeadlineCard ──────────────────────────────────────
export default function ProjectDeadlineCard() {
  const { label, daysLeft, progress } = projectDeadline;

  return (
    <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 p-5 mt-4">
      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">
        Project Deadline
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-extrabold text-gray-900">
            {daysLeft} Days
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
        <CircularProgress value={progress} />
      </div>
    </div>
  );
}
