import {
  Link2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  FileText,
} from "lucide-react";

export default function TaskSidebar() {
  return (
    <div className="space-y-8">
      {/* Details Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Details
        </h3>
        <div className="grid grid-cols-[100px_1fr] gap-y-4 text-sm">
          <div className="text-slate-500 flex items-center">Assignee</div>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
              AR
            </div>
            Alex Rivera
          </div>

          <div className="text-slate-500 flex items-center">Labels</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-semibold">
              FRONTEND
            </span>
            <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-600 text-xs font-semibold">
              UI DESIGN
            </span>
            <button className="w-6 h-6 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600">
              +
            </button>
          </div>

          <div className="text-slate-500 flex items-center">Parent</div>
          <div className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline cursor-pointer">
            <Link2 size={14} /> DC-12 Core Design System
          </div>

          <div className="text-slate-500 flex items-center">Due date</div>
          <div className="flex items-center gap-1.5 font-medium text-red-600 bg-red-50 px-2 py-1 rounded w-fit text-xs">
            <Clock size={14} /> Oct 24, 2023 (Overdue)
          </div>

          <div className="text-slate-500 flex items-center">Team</div>
          <div className="font-medium text-slate-900">Design & UX</div>

          <div className="text-slate-500 flex items-center">Reporter</div>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
              SJ
            </div>
            Sarah Jenkins
          </div>
        </div>
      </section>

      {/* Linked Items Section */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
          Linked Items
        </h3>
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
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
