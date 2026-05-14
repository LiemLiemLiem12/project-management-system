import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentService } from './comment.service';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern('comment.create')
  create(@Payload() payload: any) {
    return this.commentService.create(payload);
  }

  @MessagePattern('comment.findAllByTask')
  findAllByTask(@Payload() payload: { taskId: string; projectId: string }) {
    return this.commentService.findAllByTaskProject(
      payload.taskId,
      payload.projectId,
    );
  }

  @MessagePattern('comment.update')
  update(@Payload() payload: { id: string; [key: string]: any }) {
    const { id, ...data } = payload;
    return this.commentService.update(id, data);
  }

  @MessagePattern('comment.delete')
  delete(@Payload() payload: { id: string }) {
    return this.commentService.delete(payload.id);
  }

  @MessagePattern('comment.getSubComment')
  findSubComments(@Payload() payload: { id: string }) {
    return this.commentService.findSubComments(payload.id);
  }
}
