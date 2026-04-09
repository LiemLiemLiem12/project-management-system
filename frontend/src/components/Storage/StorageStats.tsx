import { storageStats } from "@/store/storageStore";

export default function StorageStats() {
  const { totalGB, usedGB, breakdown } = storageStats;
  const remainingGB = totalGB - usedGB;
  const remainingPct = Math.round((remainingGB / totalGB) * 100);

  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Data Storage</h1>
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-900 text-base">{usedGB} GB</span>
          {" "}out of{" "}
          <span className="font-bold text-gray-900 text-base">{totalGB / 1000} TB</span>
          {" "}used
        </p>
      </div>

      {/* Breakdown bars */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-2">
        {breakdown.map(b => (
          <div key={b.type} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: b.color }} />
            <span className="text-xs font-medium text-gray-600">{b.label}</span>
            <span className="text-xs text-gray-400">{b.percent}%</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-sm font-semibold text-gray-700">{remainingGB} GB remaining</span>
          <span className="text-sm text-gray-400">{remainingPct}%</span>
        </div>
      </div>

      {/* Progress bars */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        {breakdown.map(b => (
          <div
            key={b.type}
            className="h-full rounded-full transition-all"
            style={{ width: `${b.percent}%`, background: b.color }}
          />
        ))}
        <div className="flex-1 h-full bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}
