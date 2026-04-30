import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { DataSource, Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { RpcException, ClientProxy } from '@nestjs/microservices';

import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { GroupTask } from '../task/entities/group-task.entity';

export interface CreateProjectComplexPayload {
  name: string;
  description?: string;
  ownerId: string;
  members: { email: string; role: string }[];
}

@Injectable()
export class ProjectService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    @InjectRepository(GroupTask)
    private readonly groupTaskRepository: Repository<GroupTask>,

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

  async createComplex(payload: CreateProjectComplexPayload) {
    const { name, description, ownerId, members } = payload;

    return await this.dataSource.transaction(async (manager) => {
      const project = await manager.save(Project, {
        name,
        description,
        owner_id: ownerId,
        status: 'Active',
      });

      await manager.save(ProjectMember, {
        project_id: project.id,
        user_id: ownerId,
        role: 'Leader',
        joined_date: new Date().toISOString(),
      });

      const defaultGroups = [
        { project_id: project.id, title: 'To Do', order: 0, isSuccess: false },
        {
          project_id: project.id,
          title: 'In Progress',
          order: 1,
          isSuccess: false,
        },
        { project_id: project.id, title: 'Done', order: 2, isSuccess: true },
      ];
      await manager.save(GroupTask, defaultGroups);

      // 4. Xử lý mời thành viên qua Email (gọi sang Auth Service để lấy ID)
      if (members && members.length > 0) {
        const emails = members.map((m) => m.email);

        // Gọi Auth Service để lấy thông tin User từ Email
        const usersDetail = await firstValueFrom(
          this.authClient.send('auth.get-users-by-emails', emails).pipe(
            timeout(5000),
            catchError(() => of([])),
          ),
        );

        for (const memberInvite of members) {
          const foundUser = usersDetail.find(
            (u: any) => u.email === memberInvite.email,
          );
          if (foundUser) {
            await manager.save(ProjectMember, {
              project_id: project.id,
              user_id: foundUser.id,
              // Map role: Moderator -> Leader, còn lại là Member
              role: memberInvite.role === 'Moderator' ? 'Leader' : 'Member',
              joined_date: new Date().toISOString(),
            });
          }
        }
      }

      return project;
    });
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

  async findAllByUser(userId: string) {
    return await this.dataSource
      .getRepository(Project)
      .createQueryBuilder('project')
      .innerJoin('project_members', 'pm', 'pm.project_id = project.id')
      .where('pm.user_id = :userId', { userId })
      .orderBy('project.created_date', 'DESC')
      .getMany();
  }
}
