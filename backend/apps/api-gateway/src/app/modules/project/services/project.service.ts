import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  findAll() {
    return `This action returns all project`;
  }

  async findProject(id: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('project.find-one', { id }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  getProjectMembers(projectId: string, userId: string) {
    return this.projectClient.send('project.get-members', {
      projectId,
      userId,
    });
  }

  async addMember(payload: any) {
    try {
      const userResult = (await firstValueFrom(
        this.authClient
          .send('auth.check_email', payload.email)
          .pipe(timeout(5000)),
      )) as any;

      if (!userResult) {
        throw new HttpException(
          'Không tìm thấy tài khoản với email này',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 🚀 SỬA LỖI Ở ĐÂY: Gán ID của người được mời vào biến rõ ràng
      const targetUserId =
        userResult.id ||
        userResult._id ||
        userResult.userId ||
        (userResult.user && userResult.user.id);

      if (!targetUserId) {
        throw new HttpException(
          'API check email chạy được nhưng không chịu nhả User ID',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const fullPayload = {
        project_id: payload.project_id,
        email: payload.email,
        role: payload.role,
        user_id: targetUserId, // ID người được mời
        currentUserId: payload.currentUserId, // 🚀 ID của Leader đang thao tác
      };

      const result = await firstValueFrom(
        this.projectClient
          .send('project_member.create', fullPayload)
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to add project member',
        error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getMembers(projectId: string) {
    return this.projectClient.send('project_member.findAll', { projectId });
  }

  updateMemberRole(payload: any) {
    return this.projectClient.send('project_member.update', payload);
  }

  removeMember(projectId: string, userId: string, currentUserId: string) {
    return this.projectClient.send('project_member.delete', {
      project_id: projectId,
      user_id: userId,
      currentUserId: currentUserId,
    });
  }

  async findTask(projectId: string, taskId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('task.get-one', { projectId, taskId }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async create(createProjectDto: any, userId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('project.create_complex', {
          ...createProjectDto,
          ownerId: userId,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create project complex',
        error.statusCode || 500,
      );
    }
  }

  async getProjects(userId: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('project.find_all', userId),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch projects',
        error.statusCode || 500,
      );
    }
  }

  async acceptInvite(token: string, userId: string) {
    return await firstValueFrom(
      this.projectClient.send('project.accept_invite', { token, userId }),
    );
  }
}
