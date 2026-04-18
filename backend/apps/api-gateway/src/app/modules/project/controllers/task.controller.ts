import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Role } from '../../auth/enums/role.enum';
import { Roles } from '../../auth/decorators/role.decorator';
import { SearchSubtaskQueryDto } from '../dto/search-subtask.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('group')
  getGroupTaskByProjectId(@Query('projectId') projectId: string) {
    return this.taskService.getGroupTaskByProjectId(projectId);
  }

  @Patch(':taskId')
  updateTaskGroupTask(
    @Param('taskId') taskId: string,
    @Body('groupTaskId') groupTaskId: string,
  ) {
    return this.taskService.updateTaskGroupTask(taskId, groupTaskId);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post(':taskId/subtasks')
  addExistingSubtask(
    @Param('taskId') taskId: string,
    @Body('subtaskId') subtaskId: string,
  ) {
    return this.taskService.addExistingSubtask(taskId, subtaskId);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':taskId')
  findTask(@Param('taskId') taskId: string) {
    return this.taskService.findTask(taskId);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':taskId/available-subtasks')
  findTaskForSubtask(
    @Param('taskId') taskId: string,
    @Query() query: SearchSubtaskQueryDto,
    @Query('projectId') projectId: string,
  ) {
    const { keyword } = query;
    return this.taskService.findTaskForSubtask(keyword, projectId, taskId);
  }
}
