export default function TimelineFooter() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 20px", borderTop: "1px solid #E5E7EB",
      background: "white", flexWrap: "wrap", gap: 8, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {[
          { color: "#3B82F6", label: "8 Active Tasks" },
          { color: "#10B981", label: "12 Completed" },
          { color: "#F59E0B", label: "2 Blocked" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>
      <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
        Last synced 2 minutes ago
      </span>
    </div>
  );
}
