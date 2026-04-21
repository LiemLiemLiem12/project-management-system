import { useTaskStore } from "@/store/task.store";
import { Task, User } from "@/types";
import {
  Link2,
  Clock,
  FileText,
  Tag,
  Layers,
  Flag,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns"; // Bạn nên cài date-fns để format ngày tháng
import { useGetUserById } from "@/services/user.service";
import { useState } from "react";

const TEAM_MEMBERS: Partial<User>[] = [
  { id: "1", username: "alex_dev", avatarUrl: "A", email: "" },
  { id: "2", username: "sarah_pm", avatarUrl: "S", email: "" },
  { id: "3", username: "mike_design", avatarUrl: "M", email: "" },
  { id: "4", username: "john_doe", avatarUrl: "J", email: "" },
];

export default function TaskSidebar() {
  const currentTask: Task | null = useTaskStore((s: any) => s.currentTask);
  const {
    data: assignee,
    isPending: pendingAssignee,
  }: { data: User; isPending: boolean } = useGetUserById(
    currentTask?.assignee_id || "",
  );

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = TEAM_MEMBERS.filter((user) =>
    user?.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectAssignee = (userId: string) => {
    console.log("Cập nhật assignee mới:", userId);
    setIsAssigneeModalOpen(false);
    setSearchQuery("");
  };

  if (!currentTask) {
    return <div className="p-4 text-slate-500 italic">No task selected</div>;
  }

  return (
    <div className="space-y-8">
      {/* Details Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Details
        </h3>
        <div className="grid grid-cols-[100px_1fr] gap-y-4 text-sm">
          {/* Assignee */}
          <div className="text-slate-500 flex items-center">Assignee</div>
          {/* WRAPPER MODAL */}
          <div className="relative">
            {/* Trigger Button */}
            <div
              onClick={() => setIsAssigneeModalOpen(!isAssigneeModalOpen)}
              className="flex items-center justify-between gap-2 font-medium cursor-pointer p-1.5 -ml-1.5 rounded-md hover:bg-slate-100 transition-colors w-fit pr-3"
            >
              <div className="flex items-center gap-2">
                {currentTask.assignee_id ? (
                  <>
                    {pendingAssignee ? (
                      <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </div>
                    ) : assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                          {assignee.avatarUrl ||
                            assignee.username.slice(-2).toUpperCase()}
                        </div>
                        <span className="text-slate-900">
                          {assignee.username}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Unassigned
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* OVERLAY bắt click outside */}
            {isAssigneeModalOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAssigneeModalOpen(false)}
              />
            )}

            {/* DROPDOWN MODAL */}
            {isAssigneeModalOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all relative z-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto p-1 relative z-10 bg-white">
                  <div
                    onClick={() => handleSelectAssignee("")}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center"></div>
                    <span className="italic">Unassigned</span>
                  </div>

                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectAssignee(user?.id || "")}
                        className="flex items-center justify-between px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">
                            {user.avatarUrl ||
                              user?.username?.slice(-2).toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </div>
                        {currentTask.assignee_id === user.id && (
                          <Check size={14} className="text-blue-500" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      No users found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="text-slate-500 flex items-center">Labels</div>
          <div className="flex flex-wrap gap-2">
            {currentTask.labels && currentTask.labels.length > 0 ? (
              currentTask.labels.map((label: any) => (
                <span
                  key={label.id}
                  className="px-2.5 py-0.5 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                  }}
                >
                  {label.name.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">No labels</span>
            )}
            <button className="w-6 h-6 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600">
              +
            </button>
          </div>

          {/* Parent Task */}
          <div className="text-slate-500 flex items-center">Parent</div>
          <div>
            {currentTask.parent ? (
              <div className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline cursor-pointer group">
                <Link2 size={14} />
                <span
                  className="truncate max-w-[150px]"
                  title={currentTask.parent.title}
                >
                  {currentTask.parent.title}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">No parent</span>
            )}
          </div>

          {/* Due Date */}
          <div className="text-slate-500 flex items-center">Due date</div>
          <div>
            {currentTask.due_date ? (
              <div
                className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded w-fit text-xs ${
                  new Date(currentTask.due_date) < new Date()
                    ? "text-red-600 bg-red-50"
                    : "text-slate-700 bg-slate-100"
                }`}
              >
                <Clock size={14} />
                {format(new Date(currentTask.due_date), "MMM dd, yyyy")}
                {new Date(currentTask.due_date) < new Date() && " (Overdue)"}
              </div>
            ) : (
              <span className="text-slate-400 italic">No due date</span>
            )}
          </div>

          {/* Group Task / Team */}
          <div className="text-slate-500 flex items-center">Group</div>
          <div className="font-medium text-slate-900">
            {currentTask.groupTask?.title || "General"}
          </div>

          {/* Reporter */}
          <div className="text-slate-500 flex items-center">Reporter</div>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
              {currentTask.created_by.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-slate-900">{currentTask.created_by}</span>
          </div>
        </div>
      </section>

      {/* Linked Items Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Linked Items
        </h3>
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="p-1.5 bg-white rounded shadow-sm">
            <FileText size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none mb-1">
              UI Design Specs
            </p>
            <p className="text-xs text-slate-500">Figma Design</p>
          </div>
        </div>
      </section>
    </div>
  );
}
