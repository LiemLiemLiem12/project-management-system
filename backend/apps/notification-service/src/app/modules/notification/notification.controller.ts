import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  // =========================================================================
  // PART 1: EVENT HANDLERS (FROM RABBITMQ)
  // =========================================================================

  // 1. Role Changed Event
  @EventPattern('notify.role_changed')
  async handleRoleChanged(@Payload() data: any) {
    // 🚀 Lấy tên thật từ data, nếu không có mới lấy chữ 'Hệ thống'
    const senderName = data.senderName || 'Hệ thống';
    const projectName = data.projectName || 'Project';

    await this.notifService.createNotification({
      recipientId: data.recipientId,
      senderId: data.senderId,
      senderName: senderName, // 🚀 Lưu tên thật
      senderAvatar: data.senderAvatar, // 🚀 Lưu avatar
      title: 'Role Updated',
      message: `${senderName} changed your role to ${data.newRole} in ${projectName}.`, // 🚀 Gắn tên thật vào message
      type: 'ROLE_CHANGED',
      projectId: data.projectId,
      projectName: projectName,
      redirectUrl: `/project/${data.projectId}/dashboard`,
    });
  }

  // 2. Task Assigned Event
  @EventPattern('notify.task_assigned')
  async handleTaskAssigned(@Payload() data: any) {
    const senderName = data.senderName || 'Hệ thống';
    const projectName = data.projectName || 'Project';

    await this.notifService.createNotification({
      recipientId: data.recipientId,
      senderId: data.senderId,
      senderName: senderName, // 🚀 Lưu tên thật
      senderAvatar: data.senderAvatar, // 🚀 Lưu avatar
      title: 'New Task Assigned',
      message: `${senderName} assigned the task "${data.taskName}" to you in ${projectName}.`,
      type: 'TASK_ASSIGNED',
      projectId: data.projectId,
      projectName: projectName,
      redirectUrl: `/project/${data.projectId}/kanban`,
    });
  }

  // 3. Member Kicked Event
  @EventPattern('notify.member_kicked')
  async handleMemberKicked(@Payload() data: any) {
    const senderName = data.senderName || 'Hệ thống';
    const projectName = data.projectName || 'Project';

    await this.notifService.createNotification({
      recipientId: data.recipientId,
      senderId: data.senderId,
      senderName: senderName, // 🚀 Lưu tên thật
      senderAvatar: data.senderAvatar, // 🚀 Lưu avatar
      title: 'Removed from Project',
      message: `${senderName} removed you from ${projectName}.`,
      type: 'MEMBER_KICKED',
      projectId: data.projectId,
      projectName: projectName,
      redirectUrl: `/for-you`, // Hoặc redirect đi đâu tuỳ ông
    });
  }

  // 4. Project Invitation Event
  @EventPattern('notify.member_invited')
  async handleMemberInvited(@Payload() data: any) {
    const senderName = data.senderName || 'Hệ thống';

    await this.notifService.createNotification({
      recipientId: data.recipientId,
      senderId: data.senderId,
      senderName: senderName, // 🚀 Lưu tên thật
      senderAvatar: data.senderAvatar, // 🚀 Lưu avatar
      title: 'Project Invitation',
      message: `${senderName} invited you to join ${data.projectName} as a ${data.role}.`,
      type: 'PROJECT_INVITATION',
      projectId: data.projectId,
      projectName: data.projectName,
      redirectUrl: `/for-you`,
    });
  }

  // =========================================================================
  // PART 2: API GATEWAY ENDPOINTS (FOR FRONTEND)
  // =========================================================================

  // Get list of notifications for a user
  @MessagePattern('notify.get_user_notifications')
  async getUserNotifications(
    @Payload() data: { userId: string; unreadOnly?: boolean },
  ) {
    return await this.notifService.getUserNotifications(
      data.userId,
      data.unreadOnly,
    );
  }

  // Mark a single notification as read
  @MessagePattern('notify.mark_as_read')
  async markAsRead(@Payload() notificationId: string) {
    return await this.notifService.markAsRead(notificationId);
  }

  // Mark all notifications as read for a user
  @MessagePattern('notify.mark_all_as_read')
  async markAllAsRead(@Payload() userId: string) {
    return await this.notifService.markAllAsRead(userId);
  }
}
