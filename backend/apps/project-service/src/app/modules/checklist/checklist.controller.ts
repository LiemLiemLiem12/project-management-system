import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Controller()
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @MessagePattern('checklist.create')
  create(@Payload() payload: any) {
    return this.checklistService.create(payload);
  }

  @MessagePattern('checklist.findAllByTask')
  findAllByTask(@Payload() payload: { taskId: string }) {
    return this.checklistService.findAllByTask(payload.taskId);
  }

  @MessagePattern('checklist.update')
  update(@Payload() payload: { id: string; [key: string]: any }) {
    const { id, ...data } = payload;
    return this.checklistService.update(id, data);
  }

  @MessagePattern('checklist.delete')
  delete(@Payload() payload: { id: string }) {
    return this.checklistService.delete(payload.id);
  }
}
