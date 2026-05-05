import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  // 1. Hàm lưu thông báo mới vào DB
  async createNotification(data: Partial<Notification>) {
    const newNotif = this.notifRepo.create(data);
    return await this.notifRepo.save(newNotif);
  }

  // 2. Lấy danh sách thông báo cho 1 user (Phục vụ cho Frontend cái chuông á)
  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    const query = this.notifRepo
      .createQueryBuilder('notif')
      .where('notif.recipientId = :userId', { userId })
      .orderBy('notif.createdAt', 'DESC')
      .limit(50); // Lấy tối đa 50 thông báo mới nhất cho nhẹ

    if (unreadOnly) {
      query.andWhere('notif.isRead = :isRead', { isRead: false });
    }

    return await query.getMany();
  }

  // 3. Đánh dấu 1 thông báo là đã đọc
  async markAsRead(notificationId: string) {
    await this.notifRepo.update(notificationId, { isRead: true });
    return { success: true };
  }

  // 4. Đánh dấu tất cả thông báo của 1 user là đã đọc
  async markAllAsRead(userId: string) {
    await this.notifRepo.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
