"use client";

import { useState } from "react";
import {
  useTimelineGroups,
  ViewMode,
  addDays,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  TimelineGroup,
} from "@/store/timelineStore";
import { useGetKanbanBoard } from "@/services/task.service";
import { useGetProjectMembers } from "@/services/project.service";
import TimelineHeader from "./TimelineHeader";
import TimelineGrid from "./TimelineGrid";
import TimelineFooter from "./TimelineFooter";

function getInitialAnchor(mode: ViewMode): Date {
  const today = new Date();
  if (mode === "Weeks") return startOfWeek(today);
  if (mode === "Months") return startOfMonth(today);
  return startOfQuarter(today);
}

export default function TimelineClient({ projectId }: { projectId: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("Weeks");
  const [anchorDate, setAnchorDate] = useState(() => getInitialAnchor("Weeks"));
  const [filterText, setFilterText] = useState("");

  // Fetch data — dùng lại hooks kanban, data sync vào store
  useGetKanbanBoard(projectId);
  useGetProjectMembers(projectId);

  // Map store → TimelineGroup[]
  const groups = useTimelineGroups();

  const handleViewMode = (v: ViewMode) => {
    setViewMode(v);
    setAnchorDate(getInitialAnchor(v));
  };

  const step = (dir: 1 | -1) => {
    setAnchorDate((prev) => {
      if (viewMode === "Weeks") return addDays(prev, 14 * dir);
      if (viewMode === "Months") {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + 3 * dir);
        return startOfMonth(d);
      }
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 12 * dir);
      return startOfQuarter(d);
    });
  };

  // onGroupsChange — optimistic update local (drag & drop trên timeline)
  // Không sync lên DB vì cần gọi moveTask API — bổ sung sau nếu cần
  const handleGroupsChange = (updated: TimelineGroup[]) => {
    // TODO: gọi api.task.moveTask khi kéo task sang group khác
    // Hiện tại chỉ update local vì TimelineGrid tự quản lý state kéo thả
  };

  // Tính stats cho footer
  const allTasks = groups.flatMap((g) => g.tasks);
  const activeTasks = groups
    .filter((g) => !g.tasks.every((t) => t.status?.includes("DONE")))
    .flatMap((g) => g.tasks).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
        background: "white",
        overflow: "hidden",
      }}
    >
      <TimelineHeader
        anchorDate={anchorDate}
        viewMode={viewMode}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onToday={() => setAnchorDate(getInitialAnchor(viewMode))}
        onViewMode={handleViewMode}
        filterText={filterText}
        onFilterText={setFilterText}
      />

      <div style={{ flex: 1, overflow: "hidden" }}>
        <TimelineGrid
          groups={groups}
          onGroupsChange={handleGroupsChange}
          anchorDate={anchorDate}
          viewMode={viewMode}
          filterText={filterText}
        />
      </div>

      <TimelineFooter totalTasks={allTasks.length} />
    </div>
  );
}
