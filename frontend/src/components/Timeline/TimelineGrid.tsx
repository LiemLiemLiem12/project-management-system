"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
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
const ROW_H = 80;

// ─── View config ──────────────────────────────────────────────
interface ColDef {
  date: Date;
  label: string;
  sublabel?: string;
  width: number;
  isWeekend?: boolean;
}

function getColumns(anchor: Date, mode: ViewMode): ColDef[] {
  if (mode === "Weeks") {
    const days = getDaysInRange(anchor, 7);
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
      const mon = d.toLocaleDateString("en-US", { month: "short" });
      cols.push({ date: d, label: `${mon} ${d.getDate()}`, width: 90 });
    }
    return cols;
  }
  const cols: ColDef[] = [];
  const start = startOfQuarter(anchor);
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    cols.push({
      date: d,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      width: 90,
    });
  }
  return cols;
}

// ─── Map task to pixel position ──────────────────────────────
function getBarStyle(
  task: TimelineTask,
  cols: ColDef[],
  mode: ViewMode,
): { left: number; width: number } | null {
  const start = parseDate(task.startDate);
  const end = parseDate(task.endDate);

  if (mode === "Weeks") {
    const si = cols.findIndex((c) => isSameDay(c.date, start));
    const ei = cols.findIndex((c) => isSameDay(c.date, end));
    if (si === -1) return null;
    const eff = ei === -1 ? si : ei;
    const left = cols.slice(0, si).reduce((a, c) => a + c.width, 0) + 4;
    const width = cols.slice(si, eff + 1).reduce((a, c) => a + c.width, 0) - 8;
    return { left, width: Math.max(width, 60) };
  }

  if (mode === "Months") {
    const totalWidth = cols.reduce((a, c) => a + c.width, 0);
    const rangeStart = cols[0].date;
    const rangeEnd = addDays(cols[cols.length - 1].date, 6);
    if (end < rangeStart || start > rangeEnd) return null;
    const dayWidth = cols[0].width / 7;
    const diffStart = Math.max(
      0,
      (start.getTime() - rangeStart.getTime()) / 86400000,
    );
    const diffEnd = Math.min(
      (rangeEnd.getTime() - rangeStart.getTime()) / 86400000,
      (end.getTime() - rangeStart.getTime()) / 86400000,
    );
    const left = diffStart * dayWidth + 4;
    const width = Math.max((diffEnd - diffStart + 1) * dayWidth - 8, 40);
    return { left, width };
  }

  const rangeStart = cols[0].date;
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(
    lastCol.date.getFullYear(),
    lastCol.date.getMonth() + 1,
    0,
  );
  if (end < rangeStart || start > rangeEnd) return null;

  const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / 86400000;
  const totalPx = cols.reduce((a, c) => a + c.width, 0);
  const pxPerDay = totalPx / totalDays;

  const ds = Math.max(0, (start.getTime() - rangeStart.getTime()) / 86400000);
  const de = Math.min(
    totalDays,
    (end.getTime() - rangeStart.getTime()) / 86400000,
  );
  return {
    left: ds * pxPerDay + 4,
    width: Math.max((de - ds + 1) * pxPerDay - 8, 40),
  };
}

// ─── Today marker ─────────────────────────────────────────────
function getTodayX(cols: ColDef[], mode: ViewMode): number | null {
  const today = new Date();
  if (mode === "Weeks") {
    const i = cols.findIndex((c) => isSameDay(c.date, today));
    if (i === -1) return null;
    return (
      cols.slice(0, i).reduce((a, c) => a + c.width, 0) + cols[i].width / 2
    );
  }
  if (mode === "Months") {
    const range = cols[0].date;
    const end = addDays(cols[cols.length - 1].date, 6);
    if (today < range || today > end) return null;
    const dayPx = cols[0].width / 7;
    return ((today.getTime() - range.getTime()) / 86400000) * dayPx;
  }
  const rangeStart = cols[0].date;
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(
    lastCol.date.getFullYear(),
    lastCol.date.getMonth() + 1,
    0,
  );
  if (today < rangeStart || today > rangeEnd) return null;
  const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / 86400000;
  const totalPx = cols.reduce((a, c) => a + c.width, 0);
  return (
    (((today.getTime() - rangeStart.getTime()) / 86400000) * totalPx) /
    totalDays
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

  const filteredGroups = groups.map((g) => ({
    ...g,
    tasks: filterText
      ? g.tasks.filter((t) =>
          t.title.toLowerCase().includes(filterText.toLowerCase()),
        )
      : g.tasks,
  }));

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const next = groups.map((g) => ({ ...g, tasks: [...g.tasks] }));
    const src = next.find((g) => g.id === source.droppableId)!;
    const dst = next.find((g) => g.id === destination.droppableId)!;
    const [moved] = src.tasks.splice(source.index, 1);
    dst.tasks.splice(destination.index, 0, moved);
    onGroupsChange(next);
  };

  return (
    <div className="flex h-full overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      <div
        className="shrink-0 border-r border-gray-200 overflow-y-auto bg-white"
        style={{ width: SIDEBAR_W }}
      >
        {/* header cell */}
        <div className="h-14 border-b border-gray-200 flex items-center pl-5 sticky top-0 bg-white z-[5]">
          <span className="text-[11px] font-semibold text-gray-400 tracking-[0.07em]">
            CATEGORIES
          </span>
        </div>

        {filteredGroups.map((g) => (
          <div
            key={g.id}
            className="border-b border-gray-100 flex flex-col justify-center px-5"
            style={{ height: ROW_H }}
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
            <button className="bg-transparent border-none cursor-pointer text-left text-xs text-blue-500 font-medium mt-1 p-0 font-inherit">
              + Add
            </button>
          </div>
        ))}
      </div>

      {/* ── Scroll area ── */}
      <div className="flex-1 overflow-auto relative">
        {/* Day / period header — sticky */}
        <div
          className="flex h-14 border-b border-gray-200 sticky top-0 z-10 bg-white"
          style={{ width: totalW }}
        >
          {cols.map((col, i) => (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-center border-r border-gray-100 gap-[1px] ${
                col.isWeekend ? "bg-gray-50" : "bg-white"
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isT ? "bg-blue-600" : "bg-transparent"
                      }`}
                    >
                      <span
                        className={`text-[15px] font-bold ${
                          isT
                            ? "text-white"
                            : col.isWeekend
                              ? "text-gray-400"
                              : "text-gray-900"
                        }`}
                      >
                        {col.sublabel}
                      </span>
                    </div>
                  );
                })()}
            </div>
          ))}
        </div>

        {/* Task rows */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ width: totalW }}>
            {filteredGroups.map((group) => (
              <Droppable
                key={group.id}
                droppableId={group.id}
                direction="horizontal"
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`relative border-b border-gray-100 transition-colors duration-150 ${
                      snapshot.isDraggingOver ? "bg-blue-50" : "bg-transparent"
                    }`}
                    style={{ height: ROW_H }}
                  >
                    {/* Column stripes */}
                    {cols.map((col, i) => (
                      <div
                        key={i}
                        className={`absolute top-0 h-full border-r border-gray-100 pointer-events-none ${
                          col.isWeekend ? "bg-gray-50/80" : "bg-transparent"
                        }`}
                        style={{
                          left: cols
                            .slice(0, i)
                            .reduce((a, c) => a + c.width, 0),
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
                      const bar = getBarStyle(task, cols, viewMode);
                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={idx}
                        >
                          {(drag, dragSnap) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className={`absolute top-[10px] min-h-[56px] rounded-lg py-[7px] px-[10px] select-none ${
                                dragSnap.isDragging
                                  ? "cursor-grabbing shadow-2xl z-50"
                                  : "cursor-grab shadow-sm z-[2]"
                              } ${
                                task.color === "#F3F4F6"
                                  ? "border border-gray-200"
                                  : "border-none"
                              } ${bar ? "visible" : "invisible"}`}
                              style={{
                                left: bar ? bar.left : -9999,
                                width: bar ? bar.width : 120,
                                background: task.color,
                                ...drag.draggableProps.style,
                              }}
                            >
                              {/* Status */}
                              {task.status && (
                                <div className="flex items-center gap-1 mb-[2px]">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  <span className="text-[9px] font-bold text-gray-500 tracking-[0.05em]">
                                    {task.status}
                                  </span>
                                </div>
                              )}

                              {/* Title */}
                              <p
                                className="text-xs font-semibold m-0 leading-[1.35] line-clamp-2"
                                style={{ color: task.textColor }}
                              >
                                {task.title}
                              </p>

                              {/* Time */}
                              {task.timeLabel && (
                                <p
                                  className="text-[10px] opacity-75 mt-[2px] mb-0"
                                  style={{ color: task.textColor }}
                                >
                                  {task.timeLabel}
                                </p>
                              )}

                              {/* Members */}
                              {task.members && task.members.length > 0 && (
                                <div className="flex items-center mt-[5px]">
                                  {task.members.map((m, mi) => (
                                    <div
                                      key={mi}
                                      className={`w-[18px] h-[18px] rounded-full bg-white/35 border-[1.5px] border-white/70 flex items-center justify-center text-[7px] font-bold text-white shrink-0 ${
                                        mi > 0 ? "-ml-1" : ""
                                      }`}
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

                              {/* Attachments */}
                              {task.attachments && (
                                <div className="flex items-center gap-[3px] mt-1">
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                  >
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

                              {/* ⋯ menu icon */}
                              <div
                                className="absolute top-[6px] right-[6px] opacity-60"
                                style={{ color: task.textColor }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <circle
                                    cx="8"
                                    cy="3"
                                    r="1.2"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx="8"
                                    cy="8"
                                    r="1.2"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx="8"
                                    cy="13"
                                    r="1.2"
                                    fill="currentColor"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
