import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // ─── KANBAN BOARD ─────────────────────────────────────────────────────────

  @MessagePattern('task.get-kanban-board')
  getKanbanBoard(@Payload() payload: { projectId: string }) {
    return this.taskService.getKanbanBoard(payload.projectId);
  }

  // ─── TASKS ────────────────────────────────────────────────────────────────

  @MessagePattern('task.get-one')
  findOneTask(@Payload() payload: { projectId: string; taskId: string }) {
    return this.taskService.findOne(payload.projectId, payload.taskId);
  }

  @MessagePattern('task.create')
  createTask(@Payload() payload: any) {
    return this.taskService.create(payload);
  }
  @MessagePattern('task.find-for-subtask')
  findTaskForSubtask(
    @Payload() payload: { keyword: string; projectId: string; taskId: string },
  ) {
    return this.taskService.findTaskForSubtask(
      payload.keyword,
      payload.projectId,
      payload.taskId,
    );
  }

  @MessagePattern('task.add-existing-subtask')
  async addExistingSubtask(
    @Payload() payload: { taskId: string; subtaskId: string },
  ) {
    const result = await this.taskService.addExistingSubtask(
      payload.taskId,
      payload.subtaskId,
    );

    if (result.affected === 0) {
      throw new RpcException({
        message: 'Failed to add existing subtask',
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Subtask added successfully',
      data: {
        taskId: payload.taskId,
        subtaskId: payload.subtaskId,
      },
    };
  }

  // @MessagePattern('updateTask')
  // update(@Payload() updateTaskDto: UpdateTaskDto) {
  //   return this.taskService.update(updateTaskDto.id, updateTaskDto);
  // }

  @MessagePattern('task.update')
  updateTask(@Payload() payload: { id: string; [key: string]: any }) {
    const { id, ...data } = payload;
    return this.taskService.update(id, data);
  }

  @MessagePattern('task.move')
  moveTask(
    @Payload() payload: { id: string; group_task_id: string; position: number },
  ) {
    return this.taskService.moveTask(payload);
  }

  @MessagePattern('task.remove')
  removeTask(@Payload() payload: { id: string }) {
    return this.taskService.remove(payload.id);
  }

  @MessagePattern('task.archive')
  archiveTask(@Payload() payload: { id: string }) {
    return this.taskService.archive(payload.id);
  }

  // ─── GROUP TASKS (CÁC CỘT TRONG BẢNG) ─────────────────────────────────────

  @MessagePattern('task.group.create')
  createGroup(@Payload() payload: { project_id: string; title: string }) {
    return this.taskService.createGroup(payload);
  }

  @MessagePattern('task.group.update')
  updateGroup(@Payload() payload: { id: string; title: string }) {
    return this.taskService.updateGroup(payload.id, payload.title);
  }

  @MessagePattern('task.group.remove')
  removeGroup(@Payload() payload: { id: string }) {
    return this.taskService.removeGroup(payload.id);
  }

  @MessagePattern('task.group.reorder')
  reorderGroups(
    @Payload() payload: { projectId: string; ordered_ids: string[] },
  ) {
    return this.taskService.reorderGroups(
      payload.projectId,
      payload.ordered_ids,
    );
  }
}
