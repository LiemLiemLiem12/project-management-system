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

// 🚀 NẾU ÔNG CÓ HOOK UPDATE TASK TỪ SERVICE THÌ IMPORT VÀO ĐÂY, HOẶC DÙNG DÙNG useAPI
import { useAPI } from "@/API/useAPI";

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

  const api = useAPI(); // 🚀 Khởi tạo api để gọi Backend

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
  const handleGroupsChange = (updated: TimelineGroup[]) => {
    // 💡 Ghi chú: Chỗ này không cần gọi API vì API sẽ được gọi ở handleTaskDateChange bên dưới
    // TimelineGrid tự quản lý state mượt mà trước khi gọi API rồi.
  };

  // 🚀 HÀM MỚI: Hứng tín hiệu kéo thả từ TimelineGrid để gọi API Backend
  const handleTaskDateChange = async (
    taskId: string,
    newStartDate: string,
    newEndDate: string,
    newGroupId: string,
  ) => {
    try {
      // Gọi API cập nhật Task.
      // Dựa vào code Backend của ông, tui đoán endpoint là PATCH /:projectId/task/:taskId
      // Nhớ map đúng tên biến start_date và due_date theo Schema DB của ông nha!
      await api.task.updateTask(projectId, taskId, {
        start_date: newStartDate,
        due_date: newEndDate,
        group_task_id: newGroupId, // Kéo nhầm sang làn khác thì update luôn Group
      });
      console.log("Cập nhật ngày kéo thả thành công!");
    } catch (error) {
      console.error("Lỗi khi kéo thả cập nhật ngày:", error);
      // Nâng cao: Nếu lỗi, ông có thể reload lại Kanban Board để undo thao tác kéo
    }
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
          // 🚀 TRUYỀN HÀM VÀO ĐÂY ĐỂ TIMELINEGRID CÓ THỂ BÁO CÁO LÊN CHA
          onTaskDateChange={handleTaskDateChange}
          anchorDate={anchorDate}
          viewMode={viewMode}
          filterText={filterText}
        />
      </div>

      <TimelineFooter totalTasks={allTasks.length} />
    </div>
  );
}
