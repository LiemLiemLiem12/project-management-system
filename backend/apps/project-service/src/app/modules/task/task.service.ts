import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { Brackets, Repository } from 'typeorm';
import { GroupTask } from './entities/group-task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(GroupTask)
    private readonly groupTaskRepository: Repository<GroupTask>,
  ) {}

  create(createTaskDto: CreateTaskDto) {
    return 'This action adds a new task';
  }

  findAll() {
    return `This action returns all task`;
  }

  async findOne(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: ['groupTask', 'labels', 'subtasks', 'checklists'],
    });

    if (!task) {
      throw new RpcException({
        message: 'Task not found',
        statusCode: 404,
      });
    }

    return task;
  }
  async findTaskForSubtask(keyword: string, projectId: string, taskId: string) {
    return await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.groupTask', 'groupTask')

      .where('task.id != :taskId', { taskId })

      .andWhere('groupTask.project_id = :projectId', { projectId })

      .andWhere(
        new Brackets((qb) => {
          qb.where('task.title LIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('task.id LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      )

      .select(['task.id', 'task.title'])
      .limit(10)
      .getMany();
  }

  async addExistingSubtask(taskId: string, subtaskId: string) {
    const result = await this.taskRepository.update(subtaskId, {
      parent_id: taskId,
    });

    return result;
  }

  async getGroupTaskByProjectId(projectId: string) {
    return await this.groupTaskRepository.find({
      where: {
        project_id: projectId,
      },
    });
  }

  async updateTaskGroupTask(taskId: string, groupTaskId: string) {
    const result = await this.taskRepository.update(taskId, {
      group_task_id: groupTaskId,
    });
    return result;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
