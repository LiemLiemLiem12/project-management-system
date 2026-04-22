import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { RpcException, ClientProxy } from '@nestjs/microservices';

import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  findAll() {
    return `This action returns all project`;
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new RpcException({ message: 'Project not found', statusCode: 404 });
    }

    return project;
  }

  async getMembers(projectId: string, userId: string) {
    try {
      const members = await this.projectMemberRepository.find({
        where: { project_id: projectId },
      });

      if (!members.length) return [];

      const userIds = members.map((m) => m.user_id);
      const usersDetail = await firstValueFrom(
        this.authClient.send('auth.get-users-by-ids', userIds).pipe(
          timeout(3000),
          catchError((err) => {
            return of([]);
          }),
        ),
      );

      const enrichedMembers = members.map((member) => {
        const userInfo = usersDetail.find((u: any) => u.id === member.user_id);
        return {
          ...member,
          full_name: userInfo?.fullName || member.user_id,
          avatar_url: userInfo?.avatarUrl || '',
        };
      });

      return enrichedMembers;
    } catch (error) {
      throw error;
    }
  }

  async addMember(data: { project_id: string; user_id: string; role: string }) {
    const existingMember = await this.projectMemberRepository.findOne({
      where: { project_id: data.project_id, user_id: data.user_id },
    });

    if (existingMember) {
      throw new RpcException({
        message: 'User is already a member of this project',
        statusCode: 409,
      });
    }

    const newMember = this.projectMemberRepository.create(data);
    return await this.projectMemberRepository.save(newMember);
  }

  async updateMemberRole(projectId: string, userId: string, data: any) {
    const member = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!member) {
      throw new RpcException({
        message: 'Project member not found',
        statusCode: 404,
      });
    }

    Object.assign(member, data);
    return await this.projectMemberRepository.save(member);
  }

  async removeMember(projectId: string, userId: string) {
    const member = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!member) {
      throw new RpcException({
        message: 'Project member not found',
        statusCode: 404,
      });
    }

    await this.projectMemberRepository.remove(member);
    return {
      success: true,
      message: 'Member removed from project successfully',
    };
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  checkRole(userId: string, projectId: string) {
    return this.projectMemberRepository
      .createQueryBuilder('member')
      .where('member.project_id = :projectId', { projectId })
      .andWhere('member.user_id = :userId', { userId })
      .getOne();
  }
}
