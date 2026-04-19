import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ChecklistService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
  ) {}

  private send(pattern: string, data: any) {
    return this.projectClient.send(pattern, data);
  }

  createChecklist(payload: any) {
    return this.send('checklist.create', payload);
  }

  getChecklistsByTask(taskId: string) {
    return this.send('checklist.findAllByTask', { taskId });
  }

  updateChecklist(id: string, payload: any) {
    return this.send('checklist.update', { id, ...payload });
  }

  deleteChecklist(id: string) {
    return this.send('checklist.delete', { id });
  }
}
