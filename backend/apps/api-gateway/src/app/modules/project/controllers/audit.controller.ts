import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { AuditService } from '../services/audit.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit/logs - Flexible query audit logs by field
   * Query params: field, value, limit (default: 10), offset (default: 0)
   * Example: GET /audit/logs?field=user_id&value=123&limit=20&offset=0
   */
  @Get('logs')
  // @UseGuards(JwtAuthGuard)
  async getLogsByField(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!field || !value) {
      throw new HttpException(
        'field and value query parameters are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.auditService.getLogsByField(
      field,
      value,
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * POST /audit/logs - Create a new audit log
   * Body: CreateAuditLogDto
   */
  @Post('logs')
  @UseGuards(JwtAuthGuard)
  async createAuditLog(@Body() payload: CreateAuditLogDto) {
    if (
      !payload.user_id ||
      !payload.action ||
      !payload.entity_type ||
      !payload.entity_id
    ) {
      throw new HttpException(
        'user_id, action, entity_type, and entity_id are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.auditService.createAuditLog(payload);
  }
}
