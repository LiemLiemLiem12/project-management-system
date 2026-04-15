import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  findAll() {
    return `This action returns all project`;
  }

  async findOne(id: string) {
    try {
      const result = await firstValueFrom(
        this.projectClient.send('project.find-one', { id }),
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
}
