import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Inject,
  BadRequestException,
  Optional,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { CreateCommentMediaDto } from '../dto/create-comment-media.dto';
import { UserService } from '../../auth/user.service';
import { CommentGateway } from '../gateways/comment.gateway';

@Injectable()
export class CommentService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,

    private readonly configService: ConfigService,

    private readonly httpService: HttpService,

    private readonly userService: UserService,

    @Optional()
    private readonly commentGateway: CommentGateway,
  ) {}

  private send(pattern: string, data: any) {
    return this.projectClient.send(pattern, data);
  }

  async createComment(payload: any) {
    try {
      const result = await firstValueFrom(this.send('comment.create', payload));

      // Broadcast WebSocket event if gateway is available
      if (this.commentGateway && result) {
        const commentData = {
          id: result.id,
          task_id: result.task_id,
          user_id: result.user_id,
          content: result.content,
          parent_comment_id: result.parent_comment_id,
          medias: result.medias,
          created_at: result.created_at,
          updated_at: result.updated_at,
          user: null, // Will be enriched on frontend
        };

        // Fetch user data to enrich the comment
        try {
          const userResponse = await this.userService.findUsersByIds([
            result.user_id,
          ]);
          if (userResponse?.success && userResponse.data.length > 0) {
            commentData.user = userResponse.data[0];
          }
        } catch (err: any) {
          if (err?.statusCode === 500) {
            throw new InternalServerErrorException('User Service is downed');
          } else {
            throw err;
          }
        }

        if (result.parent_comment_id === null) {
          this.commentGateway.broadcastCommentCreated(
            result.task_id,
            commentData,
          );
        } else {
          this.commentGateway.broadcastSubCommentCreated(
            result.task_id,
            result.parent_comment_id,
            commentData,
          );
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCommentsByTask(taskId: string) {
    const comments: any[] = await firstValueFrom(
      this.send('comment.findAllByTask', { taskId }),
    );

    if (!comments || comments.length === 0) {
      return [];
    }

    const ids: string[] = [
      ...new Set(comments.map((comment) => comment.user_id)),
    ];

    const responseUser = await this.userService.findUsersByIds(ids);

    if (!responseUser?.success) {
      return comments;
    }

    const users: any[] = responseUser.data;

    const userMap = new Map(users.map((u) => [u.id, u]));

    return comments.map((comment) => ({
      ...comment,
      user: userMap.get(comment.user_id) || null,
    }));
  }

  updateComment(id: string, payload: any) {
    try {
      // Extract taskId from payload if provided (needed for WebSocket broadcast)
      const { taskId, ...updatePayload } = payload;

      return firstValueFrom(
        this.send('comment.update', { id, ...updatePayload }),
      ).then((result: any) => {
        // Broadcast WebSocket event if gateway is available
        if (this.commentGateway && taskId && result) {
          const commentData = {
            id: result.id,
            task_id: result.task_id || taskId,
            user_id: result.user_id,
            content: result.content,
            parent_comment_id: result.parent_comment_id,
            medias: result.medias,
            updated_at: result.updated_at,
            edited_by: result.user_id,
          };

          this.commentGateway.broadcastCommentUpdated(taskId, commentData);
        }

        return result;
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(id: string, taskId?: string) {
    try {
      const result = await firstValueFrom(this.send('comment.delete', { id }));

      // Broadcast WebSocket event if gateway is available
      if (this.commentGateway && (taskId || result?.task_id)) {
        this.commentGateway.broadcastCommentDeleted(
          taskId || result.task_id,
          id,
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async summarizeTaskComments(taskId: string) {
    return this.send('rag.summary', { taskId });
  }

  async getSubComments(id: string) {
    const comments: any[] = await firstValueFrom(
      this.send('comment.getSubComment', { id }),
    );

    if (!comments) return [];

    const ids: string[] = [
      ...new Set(comments.map((comment) => comment.user_id)),
    ];

    const responseUser = await this.userService.findUsersByIds(ids);

    if (!responseUser?.success) {
      return comments;
    }

    const users: any[] = responseUser.data;

    const userMap = new Map(users.map((u) => [u.id, u]));

    return comments.map((comment) => ({
      ...comment,
      user: userMap.get(comment.user_id) || null,
    }));
  }

  async uploadFiles(
    files: Express.Multer.File,
  ): Promise<CreateCommentMediaDto[]> {
    const STORAGE_PORT = this.configService.get<string>('STORAGE_PORT');
    const formData = new FormData();

    if (files && files.length > 0) {
      files.forEach((file: any) => {
        formData.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `http://localhost:${STORAGE_PORT}/comments/upload`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        ),
      );

      const data = response?.data.files || [];

      const medias: CreateCommentMediaDto[] = data.map((file: any) => {
        return new CreateCommentMediaDto(
          file.file_name,
          file.file_url,
          file.file_type,
          file.file_size,
          file.public_id,
        );
      });

      return medias;
    } catch (error: any) {
      console.error(error?.message);
      throw new BadRequestException('Can not uploading to Cloud');
    }
  }
}
