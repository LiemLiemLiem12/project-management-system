import { Controller, Get, Param } from '@nestjs/common';
import { RagService } from './rag.service';
import { OnEvent } from '@nestjs/event-emitter';
import { OnModuleInit } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('rag')
export class RagController {
  constructor(private ragService: RagService) {}

  @OnEvent('rag.sync-comment-to-vector')
  async syncCommentToVector(payload: {
    commentId: string;
    taskId: string;
    content: string;
  }) {
    await this.ragService.syncCommentToVector(
      payload.commentId,
      payload.taskId,
      payload.content,
    );
  }

  @MessagePattern('rag.summary')
  summarizeTaskComments(@Payload() payload: { taskId: string }) {
    return this.ragService.summarizeTaskComments(payload.taskId);
  }
}
