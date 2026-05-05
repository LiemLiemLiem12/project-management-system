import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

@Controller('notification') // Đặt tên số ít để đồng bộ với 'project'
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly: string,
  ) {
    const userId = req.user.userId;
    const isUnreadOnly = unreadOnly === 'true';

    return this.notificationService.getUserNotifications(userId, isUnreadOnly);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.userId;

    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
