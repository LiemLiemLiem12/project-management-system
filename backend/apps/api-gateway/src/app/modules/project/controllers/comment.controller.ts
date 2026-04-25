import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  createComment(@Body() body: CreateCommentDto) {
    return this.commentService.createComment(body);
  }

  @Get('task/:taskId')
  getCommentsByTask(@Param('taskId') taskId: string) {
    return this.commentService.getCommentsByTask(taskId);
  }

  @Patch(':id')
  updateComment(@Param('id') id: string, @Body() body: any) {
    return this.commentService.updateComment(id, body);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }

  @Get('summary/task/:taskId')
  async summarizeTaskComments(@Param('taskId') taskId: string) {
    console.log(taskId);
    return this.commentService.summarizeTaskComments(taskId);
  }
}
