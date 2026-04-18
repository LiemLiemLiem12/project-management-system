import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable()
export class TaskService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
  ) {}

  async findTask(taskId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('task.get-one', { taskId }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async findTaskForSubtask(keyword: string, projectId: string, taskId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('task.find-for-subtask', {
          keyword,
          projectId,
          taskId,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async addExistingSubtask(taskId: string, subtaskId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('task.add-existing-subtask', {
          taskId,
          subtaskId,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async getGroupTaskByProjectId(projectId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('task.get-group-task-by-project-id', {
          projectId,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async updateTaskGroupTask(taskId: string, groupTaskId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('task.update-task-group-task', {
          taskId,
          groupTaskId,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }
}
