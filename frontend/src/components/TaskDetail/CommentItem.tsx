import { useState } from "react";
import {
  CornerUpLeft,
  ThumbsUp,
  SmilePlus,
  Edit2,
  MoreHorizontal,
} from "lucide-react";
import { Comment, CommentMedia } from "../../types";
import { useGetSubComments } from "@/services/comment.service";
import Image from "next/image";
import { CommentInput } from "./CommentInput";

interface CommentItemProps {
  comment?: Comment;
  isLoading?: boolean;
  onSubmitReply?: (formData: FormData) => Promise<void>;
}

const ActionButtons = ({ onReplyClick }: { onReplyClick: () => void }) => (
  <div className="flex items-center gap-3 text-slate-500 mt-1">
    <button
      onClick={onReplyClick}
      className="hover:bg-slate-200 p-1.5 rounded flex items-center gap-1 text-xs font-semibold"
    >
      <CornerUpLeft size={14} /> Reply
    </button>
  </div>
);

export function CommentItem({
  comment,
  isLoading,
  onSubmitReply,
}: CommentItemProps) {
  const [showSubComments, setShowSubComments] = useState(false);
  const [isReplying, setIsReplying] = useState(false); // Trạng thái mở form reply
  const [isReplyingLoading, setIsReplyingLoading] = useState(false);

  if (isLoading || !comment) {
    return (
      <div className="flex gap-3 w-full">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-slate-200 rounded animate-pulse"></div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse"></div>
          </div>

          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-6 w-6 bg-slate-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { data: fetchedSubComments, isPending: pendingSubComments } =
    useGetSubComments(comment.id, showSubComments);

  const getAuthorName = (userId: string) =>
    userId === "u1" ? "Trần Thanh Liêm" : "User " + userId;

  const formatTime = (dateString: string) => "now";

  const displayReplies = fetchedSubComments || [];

  const handleReplySubmit = async (formData: FormData) => {
    if (onSubmitReply) {
      setIsReplyingLoading(true);
      try {
        await onSubmitReply(formData);
        setIsReplying(false);
        setShowSubComments(true);
      } finally {
        setIsReplyingLoading(false);
      }
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-[#172B4D]">
            {comment.user?.fullName || "Anonymous"}
          </span>
          <span className="text-xs text-slate-500">
            {formatTime(comment.created_at)}
          </span>
        </div>

        {comment.medias && comment.medias.length !== 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {comment.medias.map((media: CommentMedia, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group cursor-pointer"
              >
                <Image
                  src={media.file_url}
                  alt={media.file_name || "comment attachment"}
                  fill
                  sizes="(max-width: 768px) 33vw, 10vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        <p className="text-[#172B4D] mb-2">{comment.content}</p>

        <ActionButtons onReplyClick={() => setIsReplying(!isReplying)} />
        {isReplying && (
          <div className="mt-3 pl-4 sm:pl-8 border-l-2 border-slate-100">
            <CommentInput
              parentCommentId={comment.id}
              onSubmit={handleReplySubmit}
              isLoading={isReplyingLoading}
              placeholder="Viết câu trả lời..."
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
        {comment.subCommentCount &&
        comment.subCommentCount > 0 &&
        !showSubComments &&
        displayReplies.length === 0 ? (
          <button
            onClick={() => setShowSubComments(true)}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            View {comment.subCommentCount} replies
          </button>
        ) : null}

        {showSubComments && pendingSubComments && (
          <div className="mt-4 pl-4 border-l-2 border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
          </div>
        )}

        {displayReplies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-slate-200 space-y-4">
            {displayReplies.map((reply: Comment) => (
              <div key={reply.id} className="flex gap-3 mt-4">
                <div className="flex-1">
                  {reply.medias && reply.medias.length !== 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                      {reply.medias.map((media: CommentMedia, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group cursor-pointer"
                        >
                          <Image
                            src={media.file_url}
                            alt={media.file_name || "comment attachment"}
                            fill
                            sizes="(max-width: 768px) 33vw, 10vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-[#172B4D]">
                      {reply.user?.fullName || "Anonymous"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTime(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-[#172B4D] mb-2">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
