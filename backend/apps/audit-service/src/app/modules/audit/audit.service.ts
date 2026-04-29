import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  // Hàm tạo log mới
  async createLog(data: any) {
    try {
      const log = this.auditLogRepo.create({
        user_id: data.user_id,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,

        old_value: data.old_value ? JSON.stringify(data.old_value) : null,
        new_value: data.new_value ? JSON.stringify(data.new_value) : null,
        status: data.status || 'SUCCESS',
      } as any);

      await this.auditLogRepo.save(log);

      return log;
    } catch (error: any) {
      console.error(`[Audit Service] `, error.message);
      return null;
    }
  }

  async getRecentActivities(limit: number = 20) {
    return await this.auditLogRepo.find({
      order: {
        created_at: 'DESC',
      },
      take: limit,
    });
  }
}
