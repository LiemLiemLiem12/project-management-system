import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
  ) {}

  private async send<T>(pattern: string, payload: any): Promise<T> {
    try {
      return await firstValueFrom(this.projectClient.send(pattern, payload));
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  // ── Kanban Board ────────────────────────────────────────────────────────────

  getKanbanBoard(projectId: string) {
    return this.send('task.get-kanban-board', { projectId });
  }

  // ── Task ────────────────────────────────────────────────────────────────────

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
}
