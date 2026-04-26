import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CommentService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
  ) {}

  private send(pattern: string, data: any) {
    return this.projectClient.send(pattern, data);
  }

  createComment(payload: any) {
    return this.send('comment.create', payload);
  }

  getCommentsByTask(taskId: string) {
    return this.send('comment.findAllByTask', { taskId });
  }

  updateComment(id: string, payload: any) {
    return this.send('comment.update', { id, ...payload });
  }

  deleteComment(id: string) {
    return this.send('comment.delete', { id });
  }

  async summarizeTaskComments(taskId: string) {
    return this.send('rag.summary', { taskId });
  }
}
