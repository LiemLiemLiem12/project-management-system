import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Role } from '../../auth/enums/role.enum';
import { Roles } from '../../auth/decorators/role.decorator';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/:taskId')
  findTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.findTask(projectId, taskId);
  }
}
