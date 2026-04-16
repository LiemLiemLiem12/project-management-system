import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Role } from '../../auth/enums/role.enum';
import { Roles } from '../../auth/decorators/role.decorator';
import { TaskParamsDto } from '../dto/task-params.dto';
import { SearchSubtaskQueryDto } from '../dto/search-subtask.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/:taskId/subtasks')
  addExistingSubtask(
    @Param() params: { taskId: string },
    @Body() body: { subtaskId: string },
  ) {
    const { taskId } = params;
    const { subtaskId } = body;

    return this.taskService.addExistingSubtask(taskId, subtaskId);
  }

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

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get('/:projectId/:taskId/subtasks/search')
  findTaskForSubtask(
    @Param() params: TaskParamsDto,
    @Query() query: SearchSubtaskQueryDto,
  ) {
    const { projectId, taskId } = params;
    const { keyword } = query;

    return this.taskService.findTaskForSubtask(keyword, projectId, taskId);
  }
}
