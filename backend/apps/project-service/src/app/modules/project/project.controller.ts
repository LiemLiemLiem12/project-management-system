import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @MessagePattern('createProject')
  create(@Payload() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @MessagePattern('findAllProject')
  findAll() {
    return this.projectService.findAll();
  }

  @MessagePattern('findOneProject')
  findOne(@Payload() id: number) {
    return this.projectService.findOne(id);
  }

  @MessagePattern('updateProject')
  update(@Payload() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(updateProjectDto.id, updateProjectDto);
  }

  @MessagePattern('removeProject')
  remove(@Payload() id: number) {
    return this.projectService.remove(id);
  }

  @MessagePattern('project.checkRole')
  checkRole(@Payload() payload: { userId: string; projectId: string }) {
    return this.projectService.checkRole(payload.userId, payload.projectId);
  }

  @MessagePattern('project.find-one')
  findOneProject(@Payload() payload: { id: string }) {
    return this.projectService.findOne(payload.id);
  }

  @MessagePattern('project.get-members')
  getMembers(@Payload() payload: { projectId: string; userId: string }) {
    return this.projectService.getMembers(payload.projectId, payload.userId);
  }

  @MessagePattern('project_member.create')
  addMember(
    @Payload() payload: { project_id: string; user_id: string; role: string },
  ) {
    return this.projectService.addMember(payload);
  }

  @MessagePattern('project_member.update')
  updateMemberRole(
    @Payload() payload: { project_id: string; user_id: string; role: string },
  ) {
    const { project_id, user_id, ...data } = payload;
    return this.projectService.updateMemberRole(project_id, user_id, data);
  }

  @MessagePattern('project_member.delete')
  removeMember(@Payload() payload: { project_id: string; user_id: string }) {
    return this.projectService.removeMember(
      payload.project_id,
      payload.user_id,
    );
  }
}
