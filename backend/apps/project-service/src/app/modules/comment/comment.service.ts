import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { TaskService } from '../task/task.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMedia } from './entities/comment-media.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(CommentMedia)
    private readonly commentMediaRepo: Repository<CommentMedia>,

    private readonly taskService: TaskService,

    private eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateCommentDto) {
    const { task_id, medias, ...commentData } = data;

    const taskExists = await this.taskService.findOne(task_id);
    if (!taskExists) {
      throw new RpcException({ message: 'Task not found', statusCode: 404 });
    }

    const newComment: Comment = this.commentRepo.create({
      task_id,
      ...commentData,
    });
    const savedComment = await this.commentRepo.save(newComment);

    if (medias && Array.isArray(medias) && medias.length > 0) {
      const mediaEntities = medias.map((media) =>
        this.commentMediaRepo.create({
          ...media,
          comment_id: savedComment.id,
        }),
      );
      await this.commentMediaRepo.save(mediaEntities);
      savedComment.medias = mediaEntities;
    }

    this.eventEmitter.emit('rag.sync-comment-to-vector', {
      commentId: savedComment.id,
      taskId: savedComment.task_id,
      content: savedComment.content,
    });

    return savedComment;
  }

  async findAllByTask(taskId: string) {
    return await this.commentRepo.find({
      where: { task_id: taskId },
      relations: ['medias'],
      order: { created_at: 'ASC' },
    });
  }

  async update(id: string, data: any) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) {
      throw new RpcException({
        message: 'Comment not found',
        statusCode: 404,
      });
    }

    Object.assign(comment, data);
    return await this.commentRepo.save(comment);
  }

  async delete(id: string) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['medias'],
    });

    if (!comment) {
      throw new RpcException({
        message: 'Comment not found',
        statusCode: 404,
      });
    }

    if (comment.medias && comment.medias.length > 0) {
      await this.commentMediaRepo.remove(comment.medias);
    }

    await this.commentRepo.remove(comment);
    return {
      success: true,
      message: 'Comment and associated media deleted successfully',
    };
  }

  async findById(ids: string[]) {
    return this.commentRepo.find({
      where: { id: In(ids) },
      order: { created_at: 'ASC' },
    });
  }
}
