import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { RoleGuard } from '../../auth/guard/role.guard';
import { Role } from '../../auth/enums/role.enum';
import { Roles } from '../../auth/decorators/role.decorator';
import { AddMemberDto } from '../dto/add-member.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // @Get()
  // findAll() {
  //   return this.projectService.findAll();
  // }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId')
  async findOne(
    @Param('projectId') projectId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.cookie('projectId', projectId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return this.projectService.findProject(projectId);
  }

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/tasks/:taskId')
  findTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.projectService.findTask(projectId, taskId);
  }

  // @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  // @UseGuards(RoleGuard)
  // @UseGuards(JwtAuthGuard)
  @Get(':projectId/members')
  getMembers(@Param('projectId') projectId: string, @Req() req: Request) {
    const userId = (req as any).user?.userId;
    return this.projectService.getProjectMembers(projectId, userId);
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':projectId/members')
  addMember(@Param('projectId') projectId: string, @Body() body: AddMemberDto) {
    return this.projectService.addMember({ ...body, project_id: projectId });
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/members/:userId')
  updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMemberRoleDto,
  ) {
    return this.projectService.updateMemberRole({
      project_id: projectId,
      user_id: userId,
      ...body,
    });
  }

  @Roles(Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':projectId/members/:userId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectService.removeMember(projectId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }

  @Post('create_complex')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createProjectDto: any) {
    const userId = req.user.userId;

    return this.projectService.create(createProjectDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProjects(@Req() req: any) {
    const userId = req.user.userId;
    return this.projectService.getProjects(userId);
  }
}
