import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';

import { TaskService } from '../services/task.service';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Role } from '../../auth/enums/role.enum';
import { Roles } from '../../auth/decorators/role.decorator';
import { SearchSubtaskQueryDto } from '../dto/search-subtask.dto';
import { title } from 'process';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('recent-activities/:projectId')
  getRecentActivities(@Param('projectId') projectId: string) {
    // Gọi xuống service và truyền projectId vào
    return this.taskService.getRecentActivities(projectId);
  }

  @Post('recent-activities/feed')
  getFeedActivities(@Body('projectIds') projectIds: string[]) {
    return this.taskService.getFeedActivities(projectIds);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('project/:projectId')
  async getTasks(@Param('projectId') projectId: string) {
    const result = await this.taskService.findManyTask(projectId);
    return result?.tasks ?? [];
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('group')
  getGroupTaskByProjectId(@Query('projectId') projectId: string) {
    return this.taskService.getGroupTaskByProjectId(projectId);
  }

  // @Patch(':taskId')
  // updateTaskGroupTask(
  //   @Param('taskId') taskId: string,
  //   @Body('groupTaskId') groupTaskId: string,
  // ) {
  //   return this.taskService.updateTaskGroupTask(taskId, groupTaskId);
  // }

  // @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  // @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':taskId')
  updateTaskData(@Param('taskId') taskId: string, @Body() body: any) {
    return this.taskService.updateTask(taskId, body);
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
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/kanban')
  getKanbanBoard(@Param('projectId') projectId: string) {
    return this.taskService.getKanbanBoard(projectId);
  }

  // ── Group Task — TRƯỚC route task/:taskId để tránh NestJS match nhầm ─────────

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':projectId/task/group')
  createGroup(@Param('projectId') projectId: string, @Body() body: any) {
    return this.taskService.createGroup({ ...body, project_id: projectId });
  }

  // reorder TRƯỚC :groupId vì "reorder" là literal, :groupId là dynamic
  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/task/group/reorder')
  reorderGroups(
    @Param('projectId') projectId: string,
    @Body() body: { ordered_ids: string[] },
  ) {
    return this.taskService.reorderGroups(projectId, body.ordered_ids);
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/task/group/:groupId')
  updateGroup(
    @Param('groupId') groupId: string,
    @Body() body: { title: string },
  ) {
    return this.taskService.updateGroup(groupId, body.title);
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':projectId/task/group/:groupId')
  deleteGroup(@Param('groupId') groupId: string) {
    return this.taskService.deleteGroup(groupId);
  }

  // ── Task — /move và /archive TRƯỚC :taskId ────────────────────────────────

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/task/:taskId/move')
  moveTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: any,
  ) {
    return this.taskService.moveTask({ id: taskId, ...body });
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/task/:taskId/archive')
  archiveTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.archiveTask(taskId);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/task/:taskId')
  findTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.findTask(projectId, taskId);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':projectId/task')
  createTask(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.userId;
    return this.taskService.createTask({
      ...body,
      project_id: projectId,
      created_by: userId,
    });
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/task/:taskId')
  updateTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: any,
  ) {
    return this.taskService.updateTask(taskId, body);
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':projectId/task/:taskId')
  deleteTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.deleteTask(taskId);
  }

  @Get(':taskId/subtasks')
  findTaskForSubtask(
    @Param('taskId') taskId: string,
    @Query('projectId') projectId: string,
    @Query('keyword') keyword: string,
  ) {
    return this.taskService.findTaskForSubtask(keyword, projectId, taskId);
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/task/group/:groupId/rename')
  renameGroup(
    @Param('groupId') groupId: string,
    @Body() body: { title: string },
  ) {
    return this.taskService.renameGroup(groupId, body.title);
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':projectId/task/group/:groupId/with-fallback')
  deleteGroupWithFallback(
    @Param('groupId') groupId: string,
    @Body() body: { fallbackGroupId: string },
  ) {
    return this.taskService.deleteGroupWithFallback(
      groupId,
      body.fallbackGroupId,
    );
  }

  @Get('my-tasks')
  @UseGuards(JwtAuthGuard)
  getMyTasks(@Req() req: any) {
    const userId = req.user?.userId;

    return this.taskService.getMyTasks(userId);
  }
}
