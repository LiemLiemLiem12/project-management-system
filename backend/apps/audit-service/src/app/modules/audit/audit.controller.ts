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

  @MessagePattern('audit.get-by-field')
  async getLogsByField(
    @Payload()
    data: {
      fieldName: string;
      fieldValue: string;
      limit?: number;
      offset?: number;
    },
  ) {
    if (!data.fieldName || !data.fieldValue) {
      throw new RpcException({
        message: 'fieldName and fieldValue are required',
        statusCode: 400,
      });
    }

    return this.auditService.getLogsByFields(
      data.fieldName,
      data.fieldValue,
      data.limit || 10,
      data.offset || 0,
    );
  }

  @MessagePattern('audit.create')
  async createAuditLog(@Payload() data: CreateAuditLogDto) {
    if (!data.user_id || !data.action || !data.entity_type || !data.entity_id) {
      throw new RpcException({
        message: 'user_id, action, entity_type, and entity_id are required',
        statusCode: 400,
      });
    }

    const result = await this.auditService.createLog(data);
    if (!result) {
      throw new RpcException({
        message: 'Failed to create audit log',
        statusCode: 500,
      });
    }
    return result;
  }

  @EventPattern('audit.delete')
  async deleteAuditLog(@Payload() payload: { entityId: string }) {
    const result = await this.auditService.deleteAuditLog(payload.entityId);
    if (!result) {
      throw new RpcException({
        message: 'Failed to delete audit log',
        statusCode: 500,
      });
    }
    return result;
  }
}
