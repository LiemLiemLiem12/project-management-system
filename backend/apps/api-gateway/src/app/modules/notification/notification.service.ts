import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') // Khai báo đúng tên inject bên app.module.ts
    private readonly notifClient: ClientProxy,
  ) {}

  async getUserNotifications(userId: string, unreadOnly: boolean) {
    try {
      const result = await firstValueFrom(
        this.notifClient
          .send('notify.get_user_notifications', { userId, unreadOnly })
          .pipe(timeout(5000)),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch notifications',
        error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const result = await firstValueFrom(
        this.notifClient
          .send('notify.mark_as_read', notificationId)
          .pipe(timeout(5000)),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to mark notification as read',
        error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const result = await firstValueFrom(
        this.notifClient
          .send('notify.mark_all_as_read', userId)
          .pipe(timeout(5000)),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to mark all notifications as read',
        error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
