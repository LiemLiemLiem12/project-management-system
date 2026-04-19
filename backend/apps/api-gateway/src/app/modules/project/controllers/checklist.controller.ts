import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ChecklistService } from '../services/checklist.service';
import { CreateChecklistDto } from '../dto/create-checklist.dto';

@Controller('checklists')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post()
  createChecklist(@Body() body: CreateChecklistDto) {
    return this.checklistService.createChecklist(body);
  }

  @Get('task/:taskId')
  getChecklistsByTask(@Param('taskId') taskId: string) {
    return this.checklistService.getChecklistsByTask(taskId);
  }

  @Patch(':id')
  updateChecklist(@Param('id') id: string, @Body() body: any) {
    return this.checklistService.updateChecklist(id, body);
  }

  @Delete(':id')
  deleteChecklist(@Param('id') id: string) {
    return this.checklistService.deleteChecklist(id);
  }
}
