import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Gateway for real-time comment updates
 * Manages socket connections, room management, and event broadcasting
 */
@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      process.env.CORS_ORIGIN || 'http://localhost:4001',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class CommentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CommentGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Additional connection logic can be added here
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up user sockets mapping
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  /**
   * Handle client joining a task room
   * @param client Socket instance
   * @param data { taskId: string, userId: string }
   */
  @SubscribeMessage('comment:joinTask')
  handleJoinTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; userId: string },
  ) {
    const { taskId, userId } = data;
    const roomName = `task:${taskId}`;

    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);

    // Notify others in room
    client.to(roomName).emit('comment:userJoined', {
      userId,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true, room: roomName };
  }

  /**
   * Handle client leaving a task room
   * @param client Socket instance
   * @param data { taskId: string, userId: string }
   */
  @SubscribeMessage('comment:leaveTask')
  handleLeaveTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; userId: string },
  ) {
    const { taskId, userId } = data;
    const roomName = `task:${taskId}`;

    client.leave(roomName);
    this.logger.log(`Client ${client.id} left room: ${roomName}`);

    // Clean up user sockets
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }

    // Notify others in room
    this.server.to(roomName).emit('comment:userLeft', {
      userId,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true, room: roomName };
  }

  /**
   * Broadcast comment created event to task room
   * Called from CommentService after creating a comment
   */
  broadcastCommentCreated(
    taskId: string,
    commentData: any,
    excludeSocketId?: string,
  ) {
    const roomName = `task:${taskId}`;
    const payload = {
      ...commentData,
      timestamp: new Date().toISOString(),
    };

    if (excludeSocketId) {
      // Send to all except the creator
      this.server
        .to(roomName)
        .except(excludeSocketId)
        .emit('comment:created', payload);
    } else {
      // Send to all
      this.server.to(roomName).emit('comment:created', payload);
    }

    this.logger.debug(`Broadcasted comment:created to room: ${roomName}`);
  }

  /**
   * Broadcast comment updated event to task room
   */
  broadcastCommentUpdated(taskId: string, commentData: any) {
    const roomName = `task:${taskId}`;
    const payload = {
      ...commentData,
      timestamp: new Date().toISOString(),
    };

    this.server.to(roomName).emit('comment:updated', payload);
    this.logger.debug(`Broadcasted comment:updated to room: ${roomName}`);
  }

  /**
   * Broadcast comment deleted event to task room
   */
  broadcastCommentDeleted(taskId: string, commentId: string) {
    const roomName = `task:${taskId}`;
    const payload = {
      id: commentId,
      taskId,
      timestamp: new Date().toISOString(),
    };

    this.server.to(roomName).emit('comment:deleted', payload);
    this.logger.debug(`Broadcasted comment:deleted to room: ${roomName}`);
  }

  /**
   * Broadcast subcomment created event
   */
  broadcastSubCommentCreated(
    taskId: string,
    parentCommentId: string,
    commentData: any,
  ) {
    const roomName = `task:${taskId}`;
    const payload = {
      ...commentData,
      parent_comment_id: parentCommentId,
      timestamp: new Date().toISOString(),
    };

    this.server.to(roomName).emit('comment:subcommentCreated', payload);
    this.logger.debug(
      `Broadcasted comment:subcommentCreated to room: ${roomName}`,
    );
  }

  /**
   * Broadcast typing indicator for a task
   */
  broadcastUserTyping(
    taskId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
  ) {
    const roomName = `task:${taskId}`;
    const payload = {
      userId,
      userName,
      isTyping,
      timestamp: new Date().toISOString(),
    };

    this.server.to(roomName).emit('comment:userTyping', payload);
    this.logger.debug(`Broadcasted comment:userTyping to room: ${roomName}`);
  }

  /**
   * Broadcast comment count update
   */
  broadcastCommentCountUpdated(taskId: string, totalComments: number) {
    const roomName = `task:${taskId}`;
    const payload = {
      taskId,
      totalComments,
      timestamp: new Date().toISOString(),
    };

    this.server.to(roomName).emit('comment:countUpdated', payload);
    this.logger.debug(`Broadcasted comment:countUpdated to room: ${roomName}`);
  }
}
