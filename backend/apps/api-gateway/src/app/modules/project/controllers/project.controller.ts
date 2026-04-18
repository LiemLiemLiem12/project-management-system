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

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

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

  @Roles(Role.MEMBER, Role.LEADER, Role.MODERATOR)
  @UseGuards(RoleGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/members')
  getMembers(@Param('projectId') projectId: string, @Req() req: Request) {
    const userId = (req as any).user?.userId;
    return this.projectService.getProjectMembers(projectId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
