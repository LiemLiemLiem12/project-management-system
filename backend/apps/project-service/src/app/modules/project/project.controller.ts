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
}
