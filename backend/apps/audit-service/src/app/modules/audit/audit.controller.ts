import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { RpcException } from '@nestjs/microservices';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @EventPattern('log_action_created')
  async handleLogAction(@Payload() data: CreateAuditLogDto) {
    await this.auditService.createLog(data);
  }

  @MessagePattern('get_feed_logs')
  async getFeedLogs(@Payload() data: { projectIds: string[] }) {
    return this.auditService.getFeedActivities(data.projectIds);
  }

  @MessagePattern('get_recent_logs')
  async getLogs(@Payload() data: any) {
    const projectId =
      data?.projectId || (typeof data === 'string' ? data : null);

    if (!projectId) {
      // Nếu vẫn không có ID, ném lỗi rõ ràng để không bị 500 mơ hồ
      throw new RpcException({
        message: 'Project ID is required but received: ' + JSON.stringify(data),
        statusCode: 400,
      });
    }

    return this.auditService.getRecentActivities(projectId);
  }
}
