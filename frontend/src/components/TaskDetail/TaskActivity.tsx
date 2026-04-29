import { useState } from "react";
import ActivityComment from "./ActivityComment";
import ActivityHistory from "./ActivityHistory";
import ActivitySummary from "./ActivitySummary";

type TabType = "comments" | "history" | "summarize";

export default function TaskActivity() {
  const [activeTab, setActiveTab] = useState<TabType>("comments");

  return (
    <section className="mt-8">
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("comments")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "comments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          History
        </button>

        <button
          onClick={() => setActiveTab("summarize")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "summarize"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Summarize AI
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === "comments" && <ActivityComment />}
        {activeTab === "history" && <ActivityHistory />}
        {activeTab === "summarize" && <ActivitySummary />}
      </div>
    </section>
  );
}
