import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @EventPattern('log_action_created')
  async handleLogAction(@Payload() data: CreateAuditLogDto) {
    await this.auditService.createLog(data);
  }

  @MessagePattern('get_recent_logs')
  async getLogs() {
    return this.auditService.getRecentActivities();
  }
}
