"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  TimelineGroup,
  TimelineTask,
  ViewMode,
  parseDate,
  addDays,
  isWeekend,
  isToday,
  isSameDay,
  getDaysInRange,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
} from "@/store/timelineStore";

// ─── Layout constants ─────────────────────────────────────────
const SIDEBAR_W = 220;
const TASK_H = 56;
const TASK_GAP = 6;
const ROW_PAD_TOP = 8;
const ROW_PAD_BOTTOM = 8;
const WEEKS_DAY_COUNT = 14;

// ─── Hàm trị dứt điểm lệch múi giờ (Giật lùi ngày) ────────────
function getDayDiff(d1: Date, d2: Date) {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / 86400000);
}

// ─── ColDef ───────────────────────────────────────────────────
interface ColDef {
  date: Date;
  label: string;
  sublabel?: string;
  width: number;
  isWeekend?: boolean;
}

function getColumns(anchor: Date, mode: ViewMode): ColDef[] {
  if (mode === "Weeks") {
    const days = getDaysInRange(anchor, WEEKS_DAY_COUNT);
    const DAY = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days.map((d) => ({
      date: d,
      label: DAY[d.getDay()],
      sublabel: String(d.getDate()),
      width: 110,
      isWeekend: isWeekend(d),
    }));
  }
  if (mode === "Months") {
    const cols: ColDef[] = [];
    const start = startOfWeek(startOfMonth(anchor));
    for (let i = 0; i < 12; i++) {
      const d = addDays(start, i * 7);
      cols.push({
        date: d,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        width: 130,
      });
    }
    return cols;
  }
  // Quarters
  const cols: ColDef[] = [];
  const start = startOfQuarter(anchor);
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    cols.push({
      date: d,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      width: 140,
    });
  }
  return cols;
}

// ─── px/day helpers ───────────────────────────────────────────
function getPxPerDay(cols: ColDef[], mode: ViewMode): number {
  if (mode === "Weeks") return cols[0]?.width ?? 110;
  if (mode === "Months") return (cols[0]?.width ?? 130) / 7;
  const rangeStart = cols[0].date;
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(
    lastCol.date.getFullYear(),
    lastCol.date.getMonth() + 1,
    0,
  );
  return (
    cols.reduce((a, c) => a + c.width, 0) / getDayDiff(rangeStart, rangeEnd)
  );
}

function getRangeStart(cols: ColDef[]): Date {
  return cols[0].date;
}

// ─── Map task → pixel ─────────────────────────────────────────
function getBarStyle(
  task: TimelineTask,
  cols: ColDef[],
  mode: ViewMode,
): { left: number; width: number } | null {
  const start = parseDate(task.startDate);
  const end = parseDate(task.endDate);
  const pxPerDay = getPxPerDay(cols, mode);
  const rangeStart = getRangeStart(cols);

  if (mode === "Weeks") {
    const startDayOffset = getDayDiff(rangeStart, start);
    const endDayOffset = getDayDiff(rangeStart, end);

    if (endDayOffset < 0 || startDayOffset >= WEEKS_DAY_COUNT) return null;
    const clampedStart = Math.max(0, startDayOffset);
    const clampedEnd = Math.min(WEEKS_DAY_COUNT - 1, endDayOffset);
    const left = clampedStart * pxPerDay + 4;
    const width = Math.max((clampedEnd - clampedStart + 1) * pxPerDay - 8, 60);
    return { left, width };
  }

  if (mode === "Months") {
    const rangeEnd = addDays(cols[cols.length - 1].date, 6);
    if (end < rangeStart || start > rangeEnd) return null;
    const diffStart = Math.max(0, getDayDiff(rangeStart, start));
    const diffEnd = Math.min(
      getDayDiff(rangeStart, rangeEnd),
      getDayDiff(rangeStart, end),
    );
    return {
      left: diffStart * pxPerDay + 4,
      width: Math.max((diffEnd - diffStart + 1) * pxPerDay - 8, 40),
    };
  }

  // Quarters
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(
    lastCol.date.getFullYear(),
    lastCol.date.getMonth() + 1,
    0,
  );
  if (end < rangeStart || start > rangeEnd) return null;
  const ds = Math.max(0, getDayDiff(rangeStart, start));
  const de = Math.min(
    getDayDiff(rangeStart, rangeEnd),
    getDayDiff(rangeStart, end),
  );
  return {
    left: ds * pxPerDay + 4,
    width: Math.max((de - ds + 1) * pxPerDay - 8, 40),
  };
}

// ─── pxToDate ─────────────────────────────────────────────────
function pxToDate(px: number, cols: ColDef[], mode: ViewMode): string {
  const rangeStart = getRangeStart(cols);
  const pxPerDay = getPxPerDay(cols, mode);

  const dayOffset = Math.floor(px / pxPerDay);
  const result = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    rangeStart.getDate() + dayOffset,
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}`;
}

// ─── Today line ───────────────────────────────────────────────
function getTodayX(cols: ColDef[], mode: ViewMode): number | null {
  const today = new Date();
  const rangeStart = getRangeStart(cols);
  const pxPerDay = getPxPerDay(cols, mode);

  if (mode === "Weeks") {
    const i = cols.findIndex((c) => isSameDay(c.date, today));
    if (i === -1) return null;
    return (
      cols.slice(0, i).reduce((a, c) => a + c.width, 0) + cols[i].width / 2
    );
  }
  if (mode === "Months") {
    const rangeEnd = addDays(cols[cols.length - 1].date, 6);
    if (today < rangeStart || today > rangeEnd) return null;
    return getDayDiff(rangeStart, today) * pxPerDay;
  }
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(
    lastCol.date.getFullYear(),
    lastCol.date.getMonth() + 1,
    0,
  );
  if (today < rangeStart || today > rangeEnd) return null;
  return getDayDiff(rangeStart, today) * pxPerDay;
}

// ─── Lane assignment ──────────────────────────────────────────
function assignLanes(
  tasks: TimelineTask[],
  cols: ColDef[],
  mode: ViewMode,
): number[] {
  const bars = tasks.map((t) => getBarStyle(t, cols, mode));
  const lanes: number[] = new Array(tasks.length).fill(0);
  const laneEndX: number[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const bar = bars[i];
    if (!bar) continue;
    const right = bar.left + bar.width;
    let assigned = -1;
    for (let l = 0; l < laneEndX.length; l++) {
      if (laneEndX[l] <= bar.left + 2) {
        assigned = l;
        break;
      }
    }
    if (assigned === -1) {
      assigned = laneEndX.length;
      laneEndX.push(right);
    } else laneEndX[assigned] = right;
    lanes[i] = assigned;
  }
  return lanes;
}

function getRowHeight(numLanes: number): number {
  const n = Math.max(1, numLanes);
  return n * TASK_H + (n - 1) * TASK_GAP + ROW_PAD_TOP + ROW_PAD_BOTTOM;
}

// ─── Drag state ───────────────────────────────────────────────
interface DragState {
  taskId: string;
  srcGroupId: string;
  startMouseX: number;
  startMouseY: number;
  startScrollX: number;
  origLeft: number;
  durationMs: number;
  deltaPx: number;
  ghostInitialLeft: number;
}

// ─── Hover tooltip component ──────────────────────────────────
function TaskBar({
  task,
  bar,
  topOffset,
  isDragging,
  displayLeft,
  viewMode,
  onMouseDown,
}: {
  task: TimelineTask;
  bar: { left: number; width: number } | null;
  topOffset: number;
  isDragging: boolean;
  displayLeft: number;
  viewMode: ViewMode;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isCompact = viewMode !== "Weeks";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: displayLeft,
        top: topOffset,
        // Đè bẹp header khi hover
        zIndex: isDragging ? 50 : hovered ? 30 : 2,
      }}
    >
      {isCompact && hovered && !isDragging && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            minWidth: 180,
            maxWidth: 260,
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "10px 12px",
            zIndex: 200,
            pointerEvents: "none",
          }}
        >
          {task.status && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#9CA3AF",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#6B7280",
                  letterSpacing: "0.05em",
                }}
              >
                {task.status}
              </span>
            </div>
          )}
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              margin: "0 0 2px",
              color: "#111827",
              lineHeight: 1.4,
            }}
          >
            {task.title}
          </p>
          {task.timeLabel && (
            <p style={{ fontSize: 11, margin: "0 0 4px", color: "#6B7280" }}>
              {task.timeLabel}
            </p>
          )}
          {task.members && task.members.length > 0 && (
            <p style={{ fontSize: 11, margin: 0, color: "#6B7280" }}>
              {task.members.length} Team Member
              {task.members.length > 1 ? "s" : ""}
            </p>
          )}
          {task.attachments && (
            <p style={{ fontSize: 11, margin: "2px 0 0", color: "#6B7280" }}>
              📎 {task.attachments} Docs
            </p>
          )}
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: 14,
              width: 10,
              height: 10,
              background: "white",
              border: "1px solid #E5E7EB",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}

      <div
        onMouseDown={onMouseDown}
        className={`rounded-lg select-none ${
          isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab shadow-sm"
        } ${task.color === "#F3F4F6" ? "border border-gray-200" : "border-none"} ${bar ? "visible" : "invisible"}`}
        style={{
          width: bar ? bar.width : 120,
          height: TASK_H,
          background: task.color,
          opacity: isDragging ? 0.92 : 1,
          transition: isDragging ? "none" : "box-shadow 0.15s",
          padding: isCompact ? "0 10px" : "7px 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: isCompact ? "center" : "flex-start",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {isCompact ? (
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              margin: 0,
              color: task.textColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              paddingRight: 16,
            }}
          >
            {task.title}
          </p>
        ) : (
          <>
            {task.status && (
              <div className="flex items-center gap-1 mb-[2px]">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.05em]">
                  {task.status}
                </span>
              </div>
            )}
            <p
              className="text-xs font-semibold m-0 leading-[1.35] line-clamp-2"
              style={{ color: task.textColor }}
            >
              {task.title}
            </p>
            {task.timeLabel && (
              <p
                className="text-[10px] opacity-75 mt-[2px] mb-0"
                style={{ color: task.textColor }}
              >
                {task.timeLabel}
              </p>
            )}
            {task.members && task.members.length > 0 && (
              <div className="flex items-center mt-[5px]">
                {task.members.map((m, mi) => (
                  <div
                    key={mi}
                    className={`w-[18px] h-[18px] rounded-full bg-white/35 border-[1.5px] border-white/70 flex items-center justify-center text-[7px] font-bold text-white shrink-0 ${mi > 0 ? "-ml-1" : ""}`}
                  >
                    {m[0]}
                  </div>
                ))}
                <span
                  className="text-[10px] opacity-80 ml-[5px]"
                  style={{ color: task.textColor }}
                >
                  {task.members.length} Team Members
                </span>
              </div>
            )}
            {task.attachments && (
              <div className="flex items-center gap-[3px] mt-1">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M12 6.5L7 11.5a3.5 3.5 0 0 1-5-5l5.5-5.5a2 2 0 1 1 2.8 2.8L5 9.1a.5.5 0 0 1-.7-.7L9 3.7"
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[10px] text-white/90 font-medium">
                  {task.attachments} Docs
                </span>
              </div>
            )}
          </>
        )}

        <div
          className="absolute top-[6px] right-[6px] opacity-60"
          style={{ color: task.textColor }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1.2" fill="currentColor" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            <circle cx="8" cy="13" r="1.2" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function TimelineGrid({
  groups,
  onGroupsChange,
  anchorDate,
  viewMode,
  filterText,
}: {
  groups: TimelineGroup[];
  onGroupsChange: (g: TimelineGroup[]) => void;
  anchorDate: Date;
  viewMode: ViewMode;
  filterText: string;
}) {
  const cols = getColumns(anchorDate, viewMode);
  const totalW = cols.reduce((a, c) => a + c.width, 0);
  const todayX = getTodayX(cols, viewMode);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState<{
    taskId: string;
    srcGroupId: string;
    deltaPx: number;
    ghostLeft: number;
    ghostTop: number;
  } | null>(null);

  const filteredGroups = groups.map((g) => ({
    ...g,
    tasks: filterText
      ? g.tasks.filter((t) =>
          t.title.toLowerCase().includes(filterText.toLowerCase()),
        )
      : g.tasks,
  }));

  const groupLanes = filteredGroups.map((g) =>
    assignLanes(g.tasks, cols, viewMode),
  );

  const getRowTops = useCallback(() => {
    const map: Record<
      string,
      { top: number; height: number; groupId: string }
    > = {};
    rowRefsMap.current.forEach((el, groupId) => {
      const rect = el.getBoundingClientRect();
      const containerRect = scrollRef.current?.getBoundingClientRect();
      if (containerRect) {
        map[groupId] = {
          top:
            rect.top - containerRect.top + (scrollRef.current?.scrollTop ?? 0),
          height: rect.height,
          groupId,
        };
      }
    });
    return map;
  }, []);

  const onMouseDown = useCallback(
    (
      e: React.MouseEvent,
      srcGroupId: string,
      taskId: string,
      bar: { left: number; width: number },
      task: TimelineTask,
      rowTop: number,
      laneOffset: number,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const startDate = parseDate(task.startDate);
      const endDate = parseDate(task.endDate);
      const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
      const scrollTop = scrollRef.current?.scrollTop ?? 0;

      dragRef.current = {
        taskId,
        srcGroupId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startScrollX: scrollLeft,
        origLeft: bar.left,
        durationMs: endDate.getTime() - startDate.getTime(),
        deltaPx: 0,
        ghostInitialLeft: bar.left,
      };

      setDragging({
        taskId,
        srcGroupId,
        deltaPx: 0,
        ghostLeft: bar.left,
        ghostTop: rowTop + laneOffset,
      });
    },
    [],
  );

  // ── Auto-scroll & Drag Logic ──
  useEffect(() => {
    let rafId: number | null = null;
    let currentScrollSpeed = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const updateDragState = (clientX: number, clientY: number) => {
      const d = dragRef.current;
      if (!d || !scrollRef.current) return;

      const scrollLeft = scrollRef.current.scrollLeft;
      const scrollTop = scrollRef.current.scrollTop;
      const scrollDelta = scrollLeft - d.startScrollX;
      const deltaPx = clientX - d.startMouseX + scrollDelta;
      d.deltaPx = deltaPx;

      const containerRect = scrollRef.current.getBoundingClientRect();
      const ghostLeft = Math.max(0, d.origLeft + deltaPx);
      const mouseYInContainer = clientY - containerRect.top + scrollTop;
      const ghostTop = mouseYInContainer - TASK_H / 2;

      setDragging((prev) =>
        prev ? { ...prev, deltaPx, ghostLeft, ghostTop } : null,
      );
    };

    const scrollLoop = () => {
      if (currentScrollSpeed !== 0 && scrollRef.current) {
        scrollRef.current.scrollLeft += currentScrollSpeed;
        updateDragState(lastClientX, lastClientY);
      }
      rafId = requestAnimationFrame(scrollLoop);
    };

    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !scrollRef.current) return;
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      const rect = scrollRef.current.getBoundingClientRect();
      const SCROLL_ZONE = 80;
      const MAX_SPEED = 18;

      if (e.clientX > rect.right - SCROLL_ZONE) {
        const ratio = (e.clientX - (rect.right - SCROLL_ZONE)) / SCROLL_ZONE;
        currentScrollSpeed = Math.min(ratio * MAX_SPEED, MAX_SPEED);
      } else if (e.clientX < rect.left + SCROLL_ZONE) {
        const ratio = (rect.left + SCROLL_ZONE - e.clientX) / SCROLL_ZONE;
        currentScrollSpeed = -Math.min(ratio * MAX_SPEED, MAX_SPEED);
      } else {
        currentScrollSpeed = 0;
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(scrollLoop);
      }

      updateDragState(e.clientX, e.clientY);
    };

    const onUp = (e: MouseEvent) => {
      currentScrollSpeed = 0;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      setDragging(null);

      const newLeft = Math.max(0, d.origLeft + d.deltaPx);
      const newStartStr = pxToDate(newLeft, cols, viewMode);
      const newStart = new Date(newStartStr + "T00:00:00");
      const newEnd = new Date(newStart.getTime() + d.durationMs);
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (dt: Date) =>
        `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

      const rowTops = getRowTops();
      const containerRect = scrollRef.current?.getBoundingClientRect();
      const scrollTop = scrollRef.current?.scrollTop ?? 0;
      const mouseYInContainer =
        e.clientY - (containerRect?.top ?? 0) + scrollTop;

      let targetGroupId = d.srcGroupId;
      for (const info of Object.values(rowTops)) {
        if (
          mouseYInContainer >= info.top &&
          mouseYInContainer < info.top + info.height
        ) {
          targetGroupId = info.groupId;
          break;
        }
      }

      const next = groups.map((g) => ({ ...g, tasks: [...g.tasks] }));

      if (targetGroupId !== d.srcGroupId) {
        const srcGrp = next.find((g) => g.id === d.srcGroupId);
        const dstGrp = next.find((g) => g.id === targetGroupId);
        if (srcGrp && dstGrp) {
          const taskIdx = srcGrp.tasks.findIndex((t) => t.id === d.taskId);
          if (taskIdx !== -1) {
            const [moved] = srcGrp.tasks.splice(taskIdx, 1);
            moved.startDate = fmt(newStart);
            moved.endDate = fmt(newEnd);
            dstGrp.tasks.push(moved);
          }
        }
      } else {
        for (const g of next) {
          const t = g.tasks.find((t) => t.id === d.taskId);
          if (t) {
            t.startDate = fmt(newStart);
            t.endDate = fmt(newEnd);
            break;
          }
        }
      }
      onGroupsChange(next);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, viewMode, groups, onGroupsChange, getRowTops]);

  const draggingTask = dragging
    ? groups.flatMap((g) => g.tasks).find((t) => t.id === dragging.taskId)
    : null;
  const draggingBar = draggingTask
    ? {
        left: dragging!.ghostLeft,
        width: getBarStyle(draggingTask, cols, viewMode)?.width ?? 120,
      }
    : null;

  return (
    <div
      className="flex items-start h-full max-h-full font-sans"
      style={{ overflow: "hidden" }}
    >
      {/* ── Sidebar ── */}
      <div
        className="shrink-0 border-r border-gray-200 overflow-y-auto bg-white z-[6] max-h-full pb-2"
        style={{ width: SIDEBAR_W }}
      >
        <div className="h-14 border-b border-gray-200 flex items-center pl-5 sticky top-0 bg-white z-[5]">
          <span className="text-[11px] font-semibold text-gray-400 tracking-[0.07em]">
            CATEGORIES
          </span>
        </div>
        {filteredGroups.map((g, gi) => {
          const numLanes = Math.max(1, Math.max(...groupLanes[gi], 0) + 1);
          return (
            <div
              key={g.id}
              className="border-b border-gray-200 flex flex-col justify-center px-5"
              style={{ height: getRowHeight(numLanes) }}
            >
              <div className="flex items-center gap-[7px]">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: g.color }}
                />
                <span className="text-[13px] font-semibold text-gray-900">
                  {g.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable grid ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto relative max-h-full pb-2"
        style={{ cursor: dragging ? "grabbing" : "auto" }}
      >
        {/* Sticky header */}
        <div
          className="flex h-14 border-b border-gray-200 sticky top-0 z-[10] bg-white"
          style={{ width: totalW }}
        >
          {cols.map((col, i) => (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-center border-r border-gray-200 gap-[1px] ${
                col.isWeekend ? "bg-gray-100" : "bg-white"
              }`}
              style={{ width: col.width }}
            >
              <span
                className={`text-[10px] font-semibold tracking-[0.06em] ${
                  col.isWeekend ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {col.label}
              </span>
              {col.sublabel &&
                (() => {
                  const isT = viewMode === "Weeks" && isToday(col.date);
                  return (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${isT ? "bg-blue-600" : "bg-transparent"}`}
                    >
                      <span
                        className={`text-[15px] font-bold ${isT ? "text-white" : col.isWeekend ? "text-gray-400" : "text-gray-900"}`}
                      >
                        {col.sublabel}
                      </span>
                    </div>
                  );
                })()}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ width: totalW }}>
          {filteredGroups.map((group, gi) => {
            const lanes = groupLanes[gi];
            const numLanes = Math.max(1, Math.max(...lanes, 0) + 1);
            const rowH = getRowHeight(numLanes);

            return (
              <div
                key={group.id}
                ref={(el) => {
                  if (el) rowRefsMap.current.set(group.id, el);
                  else rowRefsMap.current.delete(group.id);
                }}
                className={`relative border-b border-gray-200 transition-colors duration-100 ${
                  dragging && dragging.srcGroupId !== group.id ? "" : ""
                }`}
                style={{ height: rowH }}
              >
                {/* Column stripes */}
                {cols.map((col, i) => (
                  <div
                    key={i}
                    className={`absolute top-0 h-full border-r border-gray-200 pointer-events-none ${
                      col.isWeekend ? "bg-gray-100/60" : "bg-transparent"
                    }`}
                    style={{
                      left: cols.slice(0, i).reduce((a, c) => a + c.width, 0),
                      width: col.width,
                    }}
                  />
                ))}

                {/* Today line */}
                {todayX !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-blue-600 z-[4] pointer-events-none"
                    style={{ left: todayX }}
                  />
                )}

                {/* Task bars */}
                {group.tasks.map((task, idx) => {
                  const baseBar = getBarStyle(task, cols, viewMode);
                  const lane = lanes[idx] ?? 0;
                  const topOffset = ROW_PAD_TOP + lane * (TASK_H + TASK_GAP);
                  const isThisDragging = dragging?.taskId === task.id;

                  if (isThisDragging) {
                    return (
                      <div
                        key={task.id}
                        style={{
                          position: "absolute",
                          left: baseBar?.left ?? -9999,
                          top: topOffset,
                          width: baseBar?.width ?? 120,
                          height: TASK_H,
                          background: task.color,
                          opacity: 0.25,
                          borderRadius: 8,
                          pointerEvents: "none",
                        }}
                      />
                    );
                  }

                  return (
                    <TaskBar
                      key={task.id}
                      task={task}
                      bar={baseBar}
                      topOffset={topOffset}
                      isDragging={false}
                      displayLeft={baseBar?.left ?? -9999}
                      viewMode={viewMode}
                      onMouseDown={(e) => {
                        if (!baseBar) return;
                        const rowEl = rowRefsMap.current.get(group.id);
                        const containerRect =
                          scrollRef.current?.getBoundingClientRect();
                        const scrollTop = scrollRef.current?.scrollTop ?? 0;
                        const rowTop =
                          rowEl && containerRect
                            ? rowEl.getBoundingClientRect().top -
                              containerRect.top +
                              scrollTop
                            : 0;
                        onMouseDown(
                          e,
                          group.id,
                          task.id,
                          baseBar,
                          task,
                          rowTop,
                          topOffset,
                        );
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Ghost overlay: task theo con trỏ khi kéo ── */}
        {dragging && draggingTask && draggingBar && (
          <div
            style={{
              position: "absolute",
              left: dragging.ghostLeft,
              top: dragging.ghostTop,
              width: draggingBar.width,
              height: TASK_H,
              background: draggingTask.color,
              borderRadius: 8,
              opacity: 0.95,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              pointerEvents: "none",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              overflow: "hidden",
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                margin: 0,
                color: draggingTask.textColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {draggingTask.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
