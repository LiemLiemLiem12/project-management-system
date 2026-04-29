import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import FormData from 'form-data';

import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCommentMediaDto } from '../dto/create-comment-media.dto';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async createComment(
    @Body() body: CreateCommentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    let medias: CreateCommentMediaDto[] = [];

    if (files && files.length > 0) {
      medias = await this.commentService.uploadFiles(files);
    }

    const payload = {
      ...body,
      medias,
    };

    return this.commentService.createComment(payload);
  }

  @Get('task/:taskId')
  getCommentsByTask(@Param('taskId') taskId: string) {
    return this.commentService.getCommentsByTask(taskId);
  }

  @Patch(':id')
  updateComment(@Param('id') id: string, @Body() body: any) {
    // Include taskId in the service call for WebSocket broadcast
    return this.commentService.updateComment(id, body);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string, @Body() body?: any) {
    // Accept taskId in body for WebSocket broadcast, or pass directly
    const taskId = body?.taskId;
    return this.commentService.deleteComment(id, taskId);
  }

  @Get('summary/task/:taskId')
  async summarizeTaskComments(@Param('taskId') taskId: string) {
    return this.commentService.summarizeTaskComments(taskId);
  }

  @Get('/:id')
  async getSubComments(@Param('id') id: string) {
    return this.commentService.getSubComments(id);
  }
}
