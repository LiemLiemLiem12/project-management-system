export default function TaskTableHeader() {
  return (
    <div className="hidden md:grid border-b border-gray-100 bg-white"
      style={{ gridTemplateColumns: "36px 1fr 100px 120px 130px 140px 110px 110px 36px" }}
    >
      {/* Checkbox col */}
      <div className="px-3 py-3 flex items-center justify-center">
        <input
          type="checkbox"
          className="w-3.5 h-3.5 rounded cursor-pointer accent-indigo-600"
        />
      </div>

      {[
        "TASK NAME / ID",
        "ASSIGNEE",
        "REPORTER",
        "PRIORITY",
        "STATUS",
        "CREATED DATE",
        "DUE DATE",
        "",
      ].map((col) => (
        <div
          key={col}
          className="px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
        >
          {col}
        </div>
      ))}
    </div>
  );
}
