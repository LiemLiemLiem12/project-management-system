import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { Comment } from "@/types";

interface UseCommentSocketProps {
  taskId: string;
  userId: string;
  userName?: string;
  enabled?: boolean;
}

interface CommentEvent {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  medias?: any[];
  created_at?: string;
  updated_at?: string;
  user?: any;
  parent_comment_id?: string;
  timestamp?: string;
}

/**
 * Custom hook for managing real-time comment updates via WebSocket
 * Handles:
 * - Socket connection and disconnection
 * - Room management (join/leave task room)
 * - Real-time comment events (created, updated, deleted, subcomments)
 * - React Query cache invalidation
 * - User presence tracking
 */
export const useCommentSocket = ({
  taskId,
  userId,
  userName = "Anonymous",
  enabled = true,
}: UseCommentSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !taskId || !userId) return;

    const apiGatewayUrl =
      process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:4000";

    // Create socket connection if not exists
    if (!socketRef.current) {
      socketRef.current = io(apiGatewayUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        autoConnect: true,
      });

      // Connection handlers
      socketRef.current.on("connect", () => {
        console.log("[WebSocket] Connected to server");
        isConnectedRef.current = true;

        socketRef.current?.emit("comment:joinTask", {
          taskId,
          userId,
        });
      });

      socketRef.current.on("disconnect", () => {
        console.log("[WebSocket] Disconnected from server");
        isConnectedRef.current = false;
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("[WebSocket] Connection error:", error);
      });

      // Comment created event
      socketRef.current.on("comment:created", (data: CommentEvent) => {
        console.log("[WebSocket] Comment created:", data);

        // Update React Query cache
        queryClient.setQueryData(
          ["comments", taskId],
          (oldData: Comment[] | undefined) => {
            if (!oldData || oldData.length === 0) return [data];
            // Avoid duplicates
            const exists = oldData.some((c) => c.id === data.id);
            return exists ? oldData : [data, ...oldData];
          },
        );

        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: ["currentTask", taskId],
        });
      });

      // Comment updated event
      socketRef.current.on("comment:updated", (data: CommentEvent) => {
        console.log("[WebSocket] Comment updated:", data);

        queryClient.setQueryData(
          ["comments", taskId],
          (oldData: any[] | undefined) => {
            if (!oldData) return [data];
            return oldData.map((c) => (c.id === data.id ? data : c));
          },
        );

        queryClient.invalidateQueries({
          queryKey: ["currentTask", taskId],
        });
      });

      // Comment deleted event
      socketRef.current.on("comment:deleted", (data: { id: string }) => {
        console.log("[WebSocket] Comment deleted:", data);

        queryClient.setQueryData(
          ["comments", taskId],
          (oldData: any[] | undefined) => {
            if (!oldData) return [];
            return oldData.filter((c) => c.id !== data.id);
          },
        );

        queryClient.invalidateQueries({
          queryKey: ["currentTask", taskId],
        });
      });

      // Sub-comment created event
      socketRef.current.on(
        "comment:subcommentCreated",
        (data: CommentEvent) => {
          console.log("[WebSocket] Sub-comment created:", data);

          // Invalidate the parent comment's sub-comments query
          if (data.parent_comment_id) {
            queryClient.invalidateQueries({
              queryKey: ["subComments", data.parent_comment_id],
            });
          }

          // Also update main comments list
          queryClient.invalidateQueries({
            queryKey: ["comments", taskId],
          });
        },
      );

      // Comment count updated
      socketRef.current.on(
        "comment:countUpdated",
        (data: { taskId: string; totalComments: number }) => {
          console.log("[WebSocket] Comment count updated:", data);
          // Update task query with new comment count
          queryClient.invalidateQueries({
            queryKey: ["currentTask", taskId],
          });
        },
      );

      // User typing indicator
      socketRef.current.on(
        "comment:userTyping",
        (data: { userId: string; userName: string; isTyping: boolean }) => {
          console.log("[WebSocket] User typing:", data);
          // You can emit a custom event or use a callback here
        },
      );

      // User joined
      socketRef.current.on("comment:userJoined", (data: any) => {
        console.log("[WebSocket] User joined task:", data);
      });

      // User left
      socketRef.current.on("comment:userLeft", (data: any) => {
        console.log("[WebSocket] User left task:", data);
      });
    }

    // Cleanup function
    return () => {
      if (socketRef.current && taskId) {
        socketRef.current.emit("comment:leaveTask", { taskId, userId });
      }
    };
  }, [taskId, userId, enabled, queryClient]);

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("comment:userTyping", {
          taskId,
          userId,
          userName,
          isTyping,
        });
      }
    },
    [taskId, userId, userName],
  );

  /**
   * Manually broadcast an event (useful for optimistic updates)
   */
  const broadcastEvent = useCallback((eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  /**
   * Get socket connection status
   */
  const isConnected = isConnectedRef.current;

  return {
    socket: socketRef.current,
    isConnected,
    emitTyping,
    broadcastEvent,
  };
};
