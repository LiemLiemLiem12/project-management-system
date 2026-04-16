import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto) {
    return 'This action adds a new task';
  }

  findAll() {
    return `This action returns all task`;
  }

  async findOne(projectId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        groupTask: {
          project_id: projectId,
        },
      },
      relations: ['groupTask', 'labels'],
    });

    if (!task) {
      throw new RpcException({
        message: 'Task not found',
        statusCode: 404,
      });
    }

    return task;
  }
  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
