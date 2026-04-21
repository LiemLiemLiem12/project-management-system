import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LabelService {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly client: ClientProxy,
  ) {}

  private send(pattern: string, data: any) {
    return this.client.send(pattern, data);
  }

  createLabel(payload: any) {
    return this.send('label.create', payload);
  }

  getLabelsByProject(projectId: string) {
    return this.send('label.findAllByProject', { projectId });
  }

  updateLabel(id: string, payload: any) {
    return this.send('label.update', { id, ...payload });
  }

  deleteLabel(id: string) {
    return this.send('label.delete', { id });
  }
}
