"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  TimelineGroup, TimelineTask, ViewMode,
  parseDate, addDays, isWeekend, isToday, isSameDay,
  getDaysInRange, startOfWeek, startOfMonth, startOfQuarter,
} from "@/store/timelineStore";

// ─── Layout constants ─────────────────────────────────────────
const SIDEBAR_W = 220;
const ROW_H = 80;

// ─── View config ──────────────────────────────────────────────
interface ColDef { date: Date; label: string; sublabel?: string; width: number; isWeekend?: boolean }

function getColumns(anchor: Date, mode: ViewMode): ColDef[] {
  if (mode === "Weeks") {
    const days = getDaysInRange(anchor, 7);
    const DAY = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    return days.map(d => ({
      date: d, label: DAY[d.getDay()], sublabel: String(d.getDate()),
      width: 110, isWeekend: isWeekend(d),
    }));
  }
  if (mode === "Months") {
    // Show 12 weeks — 3 months
    const cols: ColDef[] = [];
    const start = startOfWeek(startOfMonth(anchor));
    for (let i = 0; i < 12; i++) {
      const d = addDays(start, i * 7);
      const mon = d.toLocaleDateString("en-US", { month: "short" });
      cols.push({ date: d, label: `${mon} ${d.getDate()}`, width: 90 });
    }
    return cols;
  }
  // Quarters — 12 months
  const cols: ColDef[] = [];
  const start = startOfQuarter(anchor);
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    cols.push({ date: d, label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), width: 90 });
  }
  return cols;
}

// ─── Map task to pixel position ──────────────────────────────
function getBarStyle(task: TimelineTask, cols: ColDef[], mode: ViewMode): { left: number; width: number } | null {
  const start = parseDate(task.startDate);
  const end   = parseDate(task.endDate);

  if (mode === "Weeks") {
    const si = cols.findIndex(c => isSameDay(c.date, start));
    const ei = cols.findIndex(c => isSameDay(c.date, end));
    if (si === -1) return null;
    const eff = ei === -1 ? si : ei;
    const left = cols.slice(0, si).reduce((a, c) => a + c.width, 0) + 4;
    const width = cols.slice(si, eff + 1).reduce((a, c) => a + c.width, 0) - 8;
    return { left, width: Math.max(width, 60) };
  }

  if (mode === "Months") {
    // each col = 7 days
    const totalWidth = cols.reduce((a, c) => a + c.width, 0);
    const rangeStart = cols[0].date;
    const rangeEnd   = addDays(cols[cols.length - 1].date, 6);
    if (end < rangeStart || start > rangeEnd) return null;
    const dayWidth = cols[0].width / 7;
    const diffStart = Math.max(0, (start.getTime() - rangeStart.getTime()) / 86400000);
    const diffEnd   = Math.min(
      (rangeEnd.getTime() - rangeStart.getTime()) / 86400000,
      (end.getTime() - rangeStart.getTime()) / 86400000
    );
    const left = diffStart * dayWidth + 4;
    const width = Math.max((diffEnd - diffStart + 1) * dayWidth - 8, 40);
    return { left, width };
  }

  // Quarters — each col = 1 month
  const rangeStart = cols[0].date;
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(lastCol.date.getFullYear(), lastCol.date.getMonth() + 1, 0);
  if (end < rangeStart || start > rangeEnd) return null;

  const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / 86400000;
  const totalPx   = cols.reduce((a, c) => a + c.width, 0);
  const pxPerDay  = totalPx / totalDays;

  const ds = Math.max(0, (start.getTime() - rangeStart.getTime()) / 86400000);
  const de = Math.min(totalDays, (end.getTime() - rangeStart.getTime()) / 86400000);
  return { left: ds * pxPerDay + 4, width: Math.max((de - ds + 1) * pxPerDay - 8, 40) };
}

// ─── Today marker ─────────────────────────────────────────────
function getTodayX(cols: ColDef[], mode: ViewMode): number | null {
  const today = new Date();
  if (mode === "Weeks") {
    const i = cols.findIndex(c => isSameDay(c.date, today));
    if (i === -1) return null;
    return cols.slice(0, i).reduce((a, c) => a + c.width, 0) + cols[i].width / 2;
  }
  if (mode === "Months") {
    const range = cols[0].date;
    const end = addDays(cols[cols.length - 1].date, 6);
    if (today < range || today > end) return null;
    const dayPx = cols[0].width / 7;
    return (today.getTime() - range.getTime()) / 86400000 * dayPx;
  }
  // Quarters
  const rangeStart = cols[0].date;
  const lastCol = cols[cols.length - 1];
  const rangeEnd = new Date(lastCol.date.getFullYear(), lastCol.date.getMonth() + 1, 0);
  if (today < rangeStart || today > rangeEnd) return null;
  const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / 86400000;
  const totalPx = cols.reduce((a, c) => a + c.width, 0);
  return (today.getTime() - rangeStart.getTime()) / 86400000 * totalPx / totalDays;
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

  const filteredGroups = groups.map(g => ({
    ...g,
    tasks: filterText
      ? g.tasks.filter(t => t.title.toLowerCase().includes(filterText.toLowerCase()))
      : g.tasks,
  }));

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const next = groups.map(g => ({ ...g, tasks: [...g.tasks] }));
    const src = next.find(g => g.id === source.droppableId)!;
    const dst = next.find(g => g.id === destination.droppableId)!;
    const [moved] = src.tasks.splice(source.index, 1);
    dst.tasks.splice(destination.index, 0, moved);
    onGroupsChange(next);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: SIDEBAR_W, flexShrink: 0,
        borderRight: "1px solid #E5E7EB",
        overflowY: "auto", background: "white",
      }}>
        {/* header cell */}
        <div style={{
          height: 56, borderBottom: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", paddingLeft: 20,
          position: "sticky", top: 0, background: "white", zIndex: 5,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.07em" }}>CATEGORIES</span>
        </div>

        {filteredGroups.map(g => (
          <div key={g.id} style={{
            height: ROW_H, borderBottom: "1px solid #F3F4F6",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "0 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{g.name}</span>
            </div>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left", fontSize: 12, color: "#3B82F6",
              fontWeight: 500, marginTop: 4, padding: 0, fontFamily: "inherit",
            }}>+ Add</button>
          </div>
        ))}
      </div>

      {/* ── Scroll area ── */}
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>

        {/* Day / period header — sticky */}
        <div style={{
          display: "flex", height: 56,
          borderBottom: "1px solid #E5E7EB",
          position: "sticky", top: 0, zIndex: 10,
          background: "white", width: totalW,
        }}>
          {cols.map((col, i) => (
            <div key={i} style={{
              width: col.width, flexShrink: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              borderRight: "1px solid #F3F4F6",
              background: col.isWeekend ? "#F9FAFB" : "white",
              gap: 1,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: col.isWeekend ? "#9CA3AF" : "#6B7280", letterSpacing: "0.06em" }}>
                {col.label}
              </span>
              {col.sublabel && (() => {
                const isT = viewMode === "Weeks" && isToday(col.date);
                return (
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isT ? "#2563EB" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: isT ? "white" : col.isWeekend ? "#9CA3AF" : "#111827" }}>
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
            {filteredGroups.map(group => (
              <Droppable key={group.id} droppableId={group.id} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      position: "relative",
                      height: ROW_H,
                      borderBottom: "1px solid #F3F4F6",
                      background: snapshot.isDraggingOver ? "#EFF6FF" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Column stripes */}
                    {cols.map((col, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        left: cols.slice(0, i).reduce((a, c) => a + c.width, 0),
                        top: 0, width: col.width, height: "100%",
                        borderRight: "1px solid #F3F4F6",
                        background: col.isWeekend ? "rgba(249,250,251,0.8)" : "transparent",
                        pointerEvents: "none",
                      }} />
                    ))}

                    {/* Today line */}
                    {todayX !== null && (
                      <div style={{
                        position: "absolute", left: todayX, top: 0, bottom: 0,
                        width: 2, background: "#2563EB", zIndex: 4, pointerEvents: "none",
                      }} />
                    )}

                    {/* Task bars */}
                    {group.tasks.map((task, idx) => {
                      const bar = getBarStyle(task, cols, viewMode);
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={idx}>
                          {(drag, dragSnap) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              style={{
                                position: "absolute",
                                left: bar ? bar.left : -9999,
                                top: 10,
                                width: bar ? bar.width : 120,
                                minHeight: 56,
                                background: task.color,
                                borderRadius: 8,
                                padding: "7px 10px",
                                cursor: dragSnap.isDragging ? "grabbing" : "grab",
                                boxShadow: dragSnap.isDragging
                                  ? "0 10px 30px rgba(0,0,0,0.2)"
                                  : "0 1px 4px rgba(0,0,0,0.08)",
                                border: task.color === "#F3F4F6" ? "1px solid #E5E7EB" : "none",
                                zIndex: dragSnap.isDragging ? 50 : 2,
                                visibility: bar ? "visible" : "hidden",
                                userSelect: "none",
                                ...drag.draggableProps.style,
                              }}
                            >
                              {/* Status */}
                              {task.status && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF" }} />
                                  <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em" }}>
                                    {task.status}
                                  </span>
                                </div>
                              )}

                              {/* Title */}
                              <p style={{
                                fontSize: 12, fontWeight: 600, color: task.textColor,
                                margin: 0, lineHeight: 1.35,
                                overflow: "hidden", textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as const,
                              }}>{task.title}</p>

                              {/* Time */}
                              {task.timeLabel && (
                                <p style={{ fontSize: 10, color: task.textColor, opacity: 0.75, margin: "2px 0 0" }}>
                                  {task.timeLabel}
                                </p>
                              )}

                              {/* Members */}
                              {task.members && task.members.length > 0 && (
                                <div style={{ display: "flex", alignItems: "center", marginTop: 5 }}>
                                  {task.members.map((m, mi) => (
                                    <div key={mi} style={{
                                      width: 18, height: 18, borderRadius: "50%",
                                      background: "rgba(255,255,255,0.35)",
                                      border: "1.5px solid rgba(255,255,255,0.7)",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 7, fontWeight: 700, color: "white",
                                      marginLeft: mi > 0 ? -4 : 0, flexShrink: 0,
                                    }}>{m[0]}</div>
                                  ))}
                                  <span style={{ fontSize: 10, color: task.textColor, opacity: 0.8, marginLeft: 5 }}>
                                    {task.members.length} Team Members
                                  </span>
                                </div>
                              )}

                              {/* Attachments */}
                              {task.attachments && (
                                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                    <path d="M12 6.5L7 11.5a3.5 3.5 0 0 1-5-5l5.5-5.5a2 2 0 1 1 2.8 2.8L5 9.1a.5.5 0 0 1-.7-.7L9 3.7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round"/>
                                  </svg>
                                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                                    {task.attachments} Docs
                                  </span>
                                </div>
                              )}

                              {/* ⋯ menu icon */}
                              <div style={{
                                position: "absolute", top: 6, right: 6,
                                color: task.textColor, opacity: 0.6,
                              }}>
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                                  <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                                  <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
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
