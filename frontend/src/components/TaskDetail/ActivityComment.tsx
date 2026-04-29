import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";
import { Comment, CreateCommentPayload } from "../../types";
import { useCreateComment, useGetComments } from "@/services/comment.service";
import { useTaskStore } from "@/store/task.store";
import { useCommentSocket } from "@/hooks/useCommentSocket";
import { useAuthStore } from "@/store/auth.store";

export default function ActivityComment() {
  const currentTask = useTaskStore((s) => s.currentTask);
  const user = useAuthStore((s) => s.user);
  const { data: comments, isPending: pendingComments } = useGetComments(
    currentTask?.id,
  );

  const { mutateAsync: createComment, isPending: pendingCreateComment } =
    useCreateComment(currentTask?.id);

  const handleSubmitComment = async (formData: FormData) => {
    if (currentTask && user) {
      formData.append("task_id", currentTask?.id);
      formData.append("user_id", user?.id);

      await createComment(formData);
    }
  };

  const { isConnected, emitTyping } = useCommentSocket({
    taskId: currentTask?.id,
    userId: user?.id || "",
  });

  if (!currentTask || !user) return;

  if (pendingComments) {
    return (
      <div className="space-y-6 pt-4">
        <CommentInput />
        {[1, 2, 3].map((index) => (
          <CommentItem key={index} isLoading={true} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <CommentInput
        isLoading={pendingCreateComment}
        onSubmit={handleSubmitComment}
      />

      {comments && comments.length === 0 ? (
        <span>No comment yet</span>
      ) : (
        comments?.map((comment) => (
          <CommentItem
            onSubmitReply={handleSubmitComment}
            key={comment.id}
            comment={comment}
          />
        ))
      )}
    </div>
  );
}
