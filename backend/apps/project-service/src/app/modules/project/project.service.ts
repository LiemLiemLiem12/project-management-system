import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { DataSource, Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { GroupTask } from '../task/entities/group-task.entity';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';

export interface CreateProjectComplexPayload {
  name: string;
  description: string;
  ownerId: string;
  members: {
    id: string;
    email: string;
    role: string;
  }[];
}

@Injectable()
export class ProjectService {
  constructor(
    private dataSource: DataSource,
    private readonly mailService: MailService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(GroupTask)
    private readonly groupTaskRepository: Repository<GroupTask>,
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE_CLIENT')
    private readonly notifClient: ClientProxy,
  ) {}

  private async getSenderInfo(
    userId: string,
  ): Promise<{ name: string; avatar: string | null }> {
    if (!userId || userId === 'unknown_user')
      return { name: 'Hệ thống', avatar: null };
    try {
      const users = await firstValueFrom(
        this.authClient.send('auth.get-users-by-ids', [userId]).pipe(
          timeout(3000),
          catchError(() => of([])),
        ),
      );
      const user = users?.find((u: any) => u.id === userId);
      return {
        name: user?.fullName || user?.username || 'Hệ thống',
        // 🚀 Đã fix thêm avatar_url để hứng đúng data từ DB của Auth Service
        avatar: user?.avatarUrl || user?.avatar_url || user?.avatar || null,
      };
    } catch (error) {
      return { name: 'Hệ thống', avatar: null };
    }
  }

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
        status: 'Active',
        invite_token: null,
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

      if (members && members.length > 0) {
        const projectMembers = members.map((memberInvite) => ({
          project_id: project.id,
          user_id: memberInvite.id,
          role: memberInvite.role,
          status: 'Pending',
          invite_token: uuidv4(),
          joined_date: new Date().toISOString(),
        }));

        await manager.save(ProjectMember, projectMembers);

        for (const pm of projectMembers) {
          const originalMember = members.find((m) => m.id === pm.user_id);

          if (originalMember?.email && pm.invite_token) {
            this.mailService
              .sendProjectInvite(
                originalMember.email,
                project.name,
                pm.role,
                pm.invite_token,
              )
              .catch(() => {});
          }
        }
      }

      return project;
    });
  }

  async getMembers(projectId: string, userId: string) {
    try {
      const members = await this.projectMemberRepository.find({
        where: { project_id: projectId, status: 'Active' },
      });

      if (!members.length) return [];

      const userIds = members.map((m) => m.user_id);
      const usersDetail = await firstValueFrom(
        this.authClient.send('auth.get-users-by-ids', userIds).pipe(
          timeout(3000),
          catchError(() => {
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

  async addMember(
    data: {
      project_id: string;
      user_id: string;
      email: string;
      role: string;
    },
    currentUserId: string = 'unknown_user',
  ) {
    const existingMember = await this.projectMemberRepository.findOne({
      where: { project_id: data.project_id, user_id: data.user_id },
    });

    if (existingMember) {
      if (existingMember.status === 'Active') {
        throw new RpcException({
          message: 'User is already an active member of this project',
          statusCode: 409,
        });
      } else {
        throw new RpcException({
          message: 'An invitation has already been sent to this user',
          statusCode: 409,
        });
      }
    }

    const project = await this.projectRepository.findOne({
      where: { id: data.project_id },
    });

    if (!project) {
      throw new RpcException({ message: 'Project not found', statusCode: 404 });
    }

    const inviteToken = uuidv4();
    const newMember = this.projectMemberRepository.create({
      project_id: data.project_id,
      user_id: data.user_id,
      role: data.role,
      status: 'Pending',
      invite_token: inviteToken,
      joined_date: new Date().toISOString(),
    });

    await this.projectMemberRepository.save(newMember);

    if (data.email) {
      this.mailService
        .sendProjectInvite(
          data.email,
          project.name,
          newMember.role,
          inviteToken,
        )
        .catch((error) => {
          console.error('Lỗi khi gửi email mời:', error);
        });
    }

    // Bắn thông báo
    const senderInfo = await this.getSenderInfo(currentUserId);
    this.notifClient.emit('notify.member_invited', {
      recipientId: data.user_id,
      senderId: currentUserId,
      senderName: senderInfo.name,
      senderAvatar: senderInfo.avatar,
      projectId: project.id,
      projectName: project.name,
      role: data.role,
    });

    return {
      success: true,
      message: 'Invitation sent successfully',
      data: newMember,
    };
  }
  async updateMemberRole(
    projectId: string,
    userId: string,
    data: any,
    currentUserId: string,
  ) {
    const member = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!member) {
      throw new RpcException({
        message: 'Project member not found',
        statusCode: 404,
      });
    }

    const oldRole = member.role;
    Object.assign(member, data);
    const updatedMember = await this.projectMemberRepository.save(member);

    // Bắn thông báo
    const senderInfo = await this.getSenderInfo(currentUserId);
    this.notifClient.emit('notify.role_changed', {
      recipientId: userId,
      senderId: currentUserId,
      senderName: senderInfo.name,
      senderAvatar: senderInfo.avatar,
      projectId: projectId,
      oldRole: oldRole,
      newRole: data.role,
    });

    return updatedMember;
  }

  async removeMember(projectId: string, userId: string, currentUserId: string) {
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

    // Bắn thông báo
    const senderInfo = await this.getSenderInfo(currentUserId);
    this.notifClient.emit('notify.member_kicked', {
      recipientId: userId,
      senderId: currentUserId,
      senderName: senderInfo.name,
      senderAvatar: senderInfo.avatar,
      projectId: projectId,
    });

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

  async checkRole(userId: string, projectId: string) {
    const res = await this.projectMemberRepository
      .createQueryBuilder('member')
      .where('member.project_id = :projectId', { projectId })
      .andWhere('member.user_id = :userId', { userId })
      .andWhere('member.status = :status', { status: 'Active' })
      .getOne();

    return res;
  }

  async findAllByUser(userId: string) {
    return await this.dataSource
      .getRepository(Project)
      .createQueryBuilder('project')
      .innerJoin('project_members', 'pm', 'pm.project_id = project.id')
      .where('pm.user_id = :userId', { userId })
      .andWhere('pm.status = :status', { status: 'Active' })
      .orderBy('project.created_date', 'DESC')
      .getMany();
  }
  async acceptInvite(token: string, userId: string) {
    const cleanToken = token.trim();
    const cleanUserId = userId.trim();

    if (!cleanUserId || cleanUserId === 'undefined') {
      throw new RpcException({
        message: 'Invalid User Identity',
        statusCode: 401,
      });
    }

    const member = await this.projectMemberRepository
      .createQueryBuilder('pm')
      .where('pm.invite_token = :token', { token: cleanToken })
      .andWhere('pm.user_id = :userId', { userId: cleanUserId })
      .andWhere('pm.status = :status', { status: 'Pending' })
      .getOne();

    if (!member) {
      throw new RpcException({
        message: 'This invitation is not for you or is invalid!',
        statusCode: 403,
      });
    }

    member.status = 'Active';
    member.invite_token = null;

    await this.projectMemberRepository.save(member);

    return {
      success: true,
      message: 'Joined successfully!',
    };
  }
}
