export default function TimelineFooter({ totalTasks }: { totalTasks: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderTop: "1px solid #E5E7EB",
        background: "white",
        flexWrap: "wrap",
        gap: 8,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3B82F6",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
            }}
          >
            {totalTasks} Total Tasks
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
        }}
      >
        Data synced from Kanban board
      </span>
    </div>
  );
}
