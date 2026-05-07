import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,
  ) {}

  /**
   * Query audit logs by a specific field with pagination
   * Supports fields: project_id, user_id, action, entity_type, entity_id
   */
  async getLogsByField(
    fieldName: string,
    fieldValue: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    try {
      const result = await firstValueFrom(
        this.auditClient.send('audit.get-by-field', {
          fieldName,
          fieldValue,
          limit,
          offset,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch audit logs',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new audit log
   */
  async createAuditLog(payload: CreateAuditLogDto) {
    try {
      const result = await firstValueFrom(
        this.auditClient.send('audit.create', payload),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create audit log',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
