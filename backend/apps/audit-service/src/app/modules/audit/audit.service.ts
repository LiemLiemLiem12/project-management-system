import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async createLog(data: CreateAuditLogDto) {
    try {
      const log = this.auditLogRepo.create({
        project_id: data.project_id,
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

  async getRecentActivities(projectId: string) {
    try {
      return await this.auditLogRepo.find({
        where: { project_id: projectId },
        order: { created_at: 'DESC' },
      });
    } catch (error: any) {
      console.error(' Lỗi Query Database:', error.message);

      throw new RpcException('Database query failed');
    }
  }

  async getFeedActivities(projectIds: string[]) {
    try {
      if (!projectIds || projectIds.length === 0) return [];

      return await this.auditLogRepo.find({
        where: { project_id: In(projectIds) }, 
        order: { created_at: 'DESC' },
        take: 30, 
      });
    } catch (error: any) {
      console.error(' Lỗi Query Feed Database:', error.message);
      throw new RpcException('Database query failed');
    }
  }
}
