import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
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

  addMember(payload: any) {
    return this.projectClient.send('project_member.create', payload);
  }

  getMembers(projectId: string) {
    return this.projectClient.send('project_member.findAll', { projectId });
  }

  updateMemberRole(payload: any) {
    return this.projectClient.send('project_member.update', payload);
  }

  removeMember(projectId: string, userId: string) {
    return this.projectClient.send('project_member.delete', {
      project_id: projectId,
      user_id: userId,
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
}
