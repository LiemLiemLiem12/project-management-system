import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @MessagePattern('createTask')
  create(@Payload() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @MessagePattern('findAllTask')
  findAll() {
    return this.taskService.findAll();
  }

  @MessagePattern('task.get-one')
  findOneTask(@Payload() payload: { taskId: string }) {
    return this.taskService.findOne(payload.taskId);
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

  @MessagePattern('task.get-group-task-by-project-id')
  getGroupTaskByProjectId(@Payload() payload: { projectId: string }) {
    return this.taskService.getGroupTaskByProjectId(payload.projectId);
  }

  @MessagePattern('task.update-task-group-task')
  async updateGroupTask(
    @Payload() payload: { taskId: string; groupTaskId: string },
  ) {
    const result = await this.taskService.updateTaskGroupTask(
      payload.taskId,
      payload.groupTaskId,
    );

    if (result.affected === 0) {
      throw new RpcException({
        message: 'Failed to update group task',
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Group task updated successfully',
      data: {
        taskId: payload.taskId,
        groupTaskId: payload.groupTaskId,
      },
    };
  }

  @MessagePattern('updateTask')
  update(@Payload() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(updateTaskDto.id, updateTaskDto);
  }

  @MessagePattern('removeTask')
  remove(@Payload() id: number) {
    return this.taskService.remove(id);
  }
}
