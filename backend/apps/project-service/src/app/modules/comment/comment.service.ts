import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { TaskService } from '../task/task.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMedia } from './entities/comment-media.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(CommentMedia)
    private readonly commentMediaRepo: Repository<CommentMedia>,

    private readonly taskService: TaskService,

    private eventEmitter: EventEmitter2,

    private readonly httpService: HttpService,

    private readonly configService: ConfigService,
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
    const parentComments = await this.commentRepo.find({
      where: {
        task_id: taskId,
        parent_comment_id: IsNull(),
      },
      relations: ['medias'],
      order: { created_at: 'DESC' },
    });

    if (parentComments.length === 0) {
      return [];
    }

    const parentIds = parentComments.map((c) => c.id);

    const countResults = await this.commentRepo
      .createQueryBuilder('comment')
      .select('comment.parent_comment_id', 'parentId')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.parent_comment_id IN (:...parentIds)', { parentIds })
      .groupBy('comment.parent_comment_id')
      .getRawMany();

    const countMap = new Map<string, number>();
    countResults.forEach((row) => {
      countMap.set(row.parentId, parseInt(row.count, 10));
    });

    return parentComments.map((comment) => ({
      ...comment,
      subCommentCount: countMap.get(comment.id) || 0,
    }));
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

  async findSubComments(parentCommentId: string) {
    const comment = this.commentRepo.findOne({
      where: { id: parentCommentId },
    });

    if (!comment) {
      throw new RpcException({
        message: 'Comment not found',
        statusCode: 404,
      });
    }

    return await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.medias', 'media')
      .where('comment.parent_comment_id = :parentCommentId', {
        parentCommentId,
      })
      .orderBy('comment.created_at', 'DESC')
      .getMany();
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

    try {
      if (comment.medias && comment.medias.length > 0) {
        const publicIds = comment.medias.flatMap((media) => media.public_id);
        const STORAGE_HOST = this.configService.get<string>('STORAGE_HOST');
        const response = await firstValueFrom(
          this.httpService.delete(`${STORAGE_HOST}/comments/images`, {
            data: { publicIds: publicIds },
          }),
        );

        if (!response.data.success) {
          throw new BadRequestException("Can't delete comment media");
        }
        await this.commentMediaRepo.remove(comment.medias);
      }

      await this.commentRepo.remove(comment);
      return {
        success: true,
        message: 'Comment and associated media deleted successfully',
      };
    } catch (error: any) {
      if (error.response) {
        console.error('--- Storage Service Response:', error.response.data);
      }

      throw new ServiceUnavailableException(
        `Storage Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async findById(ids: string[]) {
    return this.commentRepo.find({
      where: { id: In(ids) },
      order: { created_at: 'ASC' },
    });
  }
}
