import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProjectTasksResponse } from '../types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

@Injectable()
export class TaskService {
  constructor(
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,

    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,

    private readonly httpService: HttpService,

    private readonly configService: ConfigService,
  ) {}

  private async send<T>(pattern: string, payload: any): Promise<T> {
    try {
      return await firstValueFrom(this.projectClient.send(pattern, payload));
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async uploadMedias(files: Express.Multer.File) {
    const STORAGE_PORT = this.configService.get<string>('STORAGE_PORT');
    const formData = new FormData();

    if (files && files.length > 0) {
      files.forEach((file: any) => {
        formData.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `http://localhost:${STORAGE_PORT}/tasks/upload`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        ),
      );

      const data = response?.data.files || [];

      return data;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  // ── Audit Log / Recent Activities ───────────────────────────────────────────

  async getRecentActivities(projectId: string) {
    try {
      return await firstValueFrom(
        this.auditClient.send('get_recent_logs', { projectId }),
      );
    } catch (error: any) {
      console.error('Lỗi gửi qua Audit Service:', error);
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async getFeedActivities(projectIds: string[]) {
    try {
      if (!projectIds || projectIds.length === 0) return [];

      // Bắn mảng ID sang Audit Service thông qua pattern mới
      return await firstValueFrom(
        this.auditClient.send('get_feed_logs', { projectIds }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  // ── Kanban Board ────────────────────────────────────────────────────────────

  getKanbanBoard(projectId: string) {
    return this.send('task.get-kanban-board', { projectId });
  }

  // ── Task ────────────────────────────────────────────────────────────────────

  async findManyTask(projectId: string): Promise<ProjectTasksResponse> {
    return this.send('task.get-many', projectId);
  }

  findTask(projectId: string, taskId: string) {
    return this.send('task.get-one', { projectId, taskId });
  }

  createTask(payload: any) {
    return this.send('task.create', payload);
  }

  updateTask(taskId: string, payload: any) {
    return this.send('task.update', { id: taskId, ...payload });
  }

  moveTask(payload: { id: string; group_task_id: string; position: number }) {
    return this.send('task.move', payload);
  }

  deleteTask(taskId: string) {
    return this.send('task.remove', { id: taskId });
  }

  archiveTask(taskId: string) {
    return this.send('task.archive', { id: taskId });
  }

  // ── Group Task ──────────────────────────────────────────────────────────────

  createGroup(payload: { project_id: string; title: string }) {
    return this.send('task.group.create', payload);
  }

  updateGroup(groupId: string, title: string) {
    return this.send('task.group.update', { id: groupId, title });
  }

  deleteGroup(groupId: string) {
    return this.send('task.group.remove', { id: groupId });
  }

  reorderGroups(projectId: string, ordered_ids: string[]) {
    return this.send('task.group.reorder', { projectId, ordered_ids });
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

  renameGroup(groupId: string, title: string) {
    return this.send('task.group.update', { id: groupId, title });
  }

  deleteGroupWithFallback(groupId: string, fallbackGroupId: string) {
    return this.send('task.group.remove-with-fallback', {
      id: groupId,
      fallbackGroupId,
    });
  }

  getMyTasks(userId: string) {
    return this.send('get_my_tasks', { userId });
  }
}
