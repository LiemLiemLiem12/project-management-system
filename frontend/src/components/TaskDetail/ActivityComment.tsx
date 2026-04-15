"use client";
import { useState } from "react";
import {
  CornerUpLeft,
  ThumbsUp,
  SmilePlus,
  Edit2,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";

const MOCK_COMMENTS = [
  {
    id: "c1",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    time: "now",
    content: "Test",
    replies: [],
  },
  {
    id: "c2",
    author: "Trần Thanh Liêm",
    avatar: "TL",
    time: "now",
    content: "Test 1",
    replies: [
      {
        id: "c3",
        author: "Trần Thanh Liêm",
        avatar: "TL",
        time: "now",
        mention: "@Trần Thanh Liêm",
        content: "Test 2",
      },
    ],
  },
];

export default function ActivityComment() {
  return (
    <div className="space-y-6">
      {/* Comment Input Box */}
      <div className="flex gap-3">
        {/* <Avatar initials="TL" /> */}
        <div className="flex-1">
          <div className="border border-slate-300 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-text">
            <p className="text-slate-500 mb-4">Add a comment...</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <button className="flex items-center gap-1 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors">
                🎉 <span>Looks good!</span>
              </button>
              <button className="flex items-center gap-1 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors">
                👏 <span>Need help?</span>
              </button>
              <button className="flex items-center gap-1 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors">
                ⛔ <span>This is blocked...</span>
              </button>
              <button className="flex items-center gap-1 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors">
                🔍 <span>Can you clarify...?</span>
              </button>
              <button className="flex items-center gap-1 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors">
                ✅ <span>This is on track</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            <strong>Pro tip:</strong> press{" "}
            <kbd className="border border-slate-300 rounded px-1 bg-slate-50">
              M
            </kbd>{" "}
            to comment
          </p>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6 pt-4">
        {MOCK_COMMENTS.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {/* <Avatar initials={comment.avatar} /> */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-[#172B4D]">
                  {comment.author}
                </span>
                <span className="text-xs text-slate-500">{comment.time}</span>
              </div>
              <p className="text-[#172B4D] mb-2">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-3 text-slate-500">
                <button className="hover:bg-slate-200 p-1 rounded">
                  <CornerUpLeft size={16} />
                </button>
                <button className="hover:bg-slate-200 p-1 rounded">
                  <ThumbsUp size={16} />
                </button>
                <button className="hover:bg-slate-200 p-1 rounded">
                  <SmilePlus size={16} />
                </button>
                <button className="hover:bg-slate-200 p-1 rounded">
                  <Edit2 size={16} />
                </button>
                <button className="hover:bg-slate-200 p-1 rounded">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Replies (Threaded) */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-slate-200 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 mt-4">
                      {/* <Avatar initials={reply.avatar} /> */}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-[#172B4D]">
                            {reply.author}
                          </span>
                          <span className="text-xs text-slate-500">
                            {reply.time}
                          </span>
                        </div>
                        <p className="text-[#172B4D] mb-2">
                          {reply.mention && (
                            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-sm mr-1">
                              {reply.mention}
                            </span>
                          )}
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-3 text-slate-500">
                          <button className="hover:bg-slate-200 p-1 rounded">
                            <CornerUpLeft size={16} />
                          </button>
                          <button className="hover:bg-slate-200 p-1 rounded">
                            <ThumbsUp size={16} />
                          </button>
                          <button className="hover:bg-slate-200 p-1 rounded">
                            <SmilePlus size={16} />
                          </button>
                          <button className="hover:bg-slate-200 p-1 rounded">
                            <Edit2 size={16} />
                          </button>
                          <button className="hover:bg-slate-200 p-1 rounded">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
