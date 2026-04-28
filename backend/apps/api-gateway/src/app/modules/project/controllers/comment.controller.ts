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
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('files', { limits: { fileSize: 100 * 1024 } }),
  )
  createComment(
    @Body() body: CreateCommentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const serializedFiles =
      files?.map((file) => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        base64Buffer: file.buffer.toString('base64'),
      })) || [];

    const payload = {
      ...body,
      rawFiles: serializedFiles,
    };

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
