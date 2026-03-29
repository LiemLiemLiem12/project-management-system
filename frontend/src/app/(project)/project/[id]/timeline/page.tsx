"use client";

import { useState } from "react";
import {
  timelineGroups,
  ViewMode,
  addDays,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
} from "@/store/timelineStore";
import type { TimelineGroup } from "@/store/timelineStore";
import TimelineHeader from "@/components/Timeline/TimelineHeader";
import TimelineGrid from "@/components/Timeline/TimelineGrid";
import TimelineFooter from "@/components/Timeline/TimelineFooter";

function getInitialAnchor(mode: ViewMode): Date {
  const today = new Date();
  if (mode === "Weeks") return startOfWeek(today);
  if (mode === "Months") return startOfMonth(today);
  return startOfQuarter(today);
}

export default function TimelinePage() {
  const [groups, setGroups] = useState<TimelineGroup[]>(timelineGroups);
  const [viewMode, setViewMode] = useState<ViewMode>("Weeks");
  const [anchorDate, setAnchorDate] = useState(() => getInitialAnchor("Weeks"));
  const [filterText, setFilterText] = useState("");

  const handleViewMode = (v: ViewMode) => {
    setViewMode(v);
    setAnchorDate(getInitialAnchor(v));
  };

  const step = (dir: 1 | -1) => {
    setAnchorDate((prev) => {
      if (viewMode === "Weeks") return addDays(prev, 7 * dir);
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
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <TimelineHeader
        anchorDate={anchorDate}
        viewMode={viewMode}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onToday={() => {
          setAnchorDate(getInitialAnchor(viewMode));
        }}
        onViewMode={handleViewMode}
        filterText={filterText}
        onFilterText={setFilterText}
      />

      <div style={{ flex: 1, overflow: "hidden" }}>
        <TimelineGrid
          groups={groups}
          onGroupsChange={setGroups}
          anchorDate={anchorDate}
          viewMode={viewMode}
          filterText={filterText}
        />
      </div>

      <TimelineFooter />
    </div>
  );
}
