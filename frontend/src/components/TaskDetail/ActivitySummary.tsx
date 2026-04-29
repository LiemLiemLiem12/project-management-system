import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, RefreshCcw, Copy, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSummarizeTaskComments } from "@/services/comment.service";
import { useTaskStore } from "@/store/task.store";

export default function ActivitySummary() {
  const [displayedMarkdown, setDisplayedMarkdown] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [lastTypedData, setLastTypedData] = useState<string>("");

  const currentTask = useTaskStore((s) => s.currentTask);

  const {
    data: summaryData,
    isPending: pendingSummaryData,
    refetch: refetchSummaryData,
  } = useSummarizeTaskComments(currentTask?.id);

  useEffect(() => {
    if (summaryData && summaryData !== lastTypedData) {
      setDisplayedMarkdown("");
      setIsTyping(true);
      setLastTypedData(summaryData);
    }
  }, [summaryData, lastTypedData]);

  useEffect(() => {
    if (!isTyping || !summaryData) return;

    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      currentIndex++;
      setDisplayedMarkdown(summaryData.slice(0, currentIndex));

      if (currentIndex >= summaryData.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [isTyping, summaryData]);

  const handleRegenerate = async () => {
    setDisplayedMarkdown("");
    setLastTypedData("");
    await refetchSummaryData();
  };

  return (
    <div className="max-w-4xl w-full p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-start gap-3 mb-8">
        <Sparkles
          className={`w-5 h-5 text-blue-600 shrink-0 mt-0.5 ${isTyping ? "animate-pulse" : ""}`}
        />

        <div className="text-sm text-gray-800 leading-relaxed w-full min-h-[60px]">
          {pendingSummaryData ? (
            <p className="text-gray-400 animate-pulse">Loading summary by AI</p>
          ) : (
            <>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      className="text-sm text-gray-800 leading-relaxed mb-6 last:mb-0"
                      {...props}
                    />
                  ),

                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-6 first:mt-0"
                      {...props}
                    />
                  ),

                  ul: ({ node, ...props }) => (
                    <ul className="space-y-3 mb-6 last:mb-0" {...props} />
                  ),

                  li: ({ node, ...props }) => (
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 w-full">
                        {props.children}
                      </span>
                    </li>
                  ),

                  strong: ({ node, ...props }) => (
                    <strong className="font-medium text-gray-900" {...props} />
                  ),

                  em: ({ node, ...props }) => (
                    <em className="italic text-gray-700" {...props} />
                  ),
                }}
              >
                {displayedMarkdown}
              </ReactMarkdown>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isTyping || pendingSummaryData}
            className={`flex items-center gap-2 px-3 py-2 bg-[#F3F4F9] text-gray-700 text-xs font-medium rounded-md transition-colors
    ${isTyping || pendingSummaryData ? "opacity-50 cursor-not-allowed" : "hover:bg-[#E5E7F0]"}`}
          >
            <RefreshCcw
              className={`w-3.5 h-3.5 ${isTyping || pendingSummaryData ? "animate-spin" : ""}`}
            />
            Regenerate Summary
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#F3F4F9] hover:bg-[#E5E7F0] text-gray-700 text-xs font-medium rounded-md transition-colors">
            <Copy className="w-3.5 h-3.5" />
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
