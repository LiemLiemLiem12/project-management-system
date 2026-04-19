import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Checklist } from './entities/checklist.entity';
import { Task } from '../task/entities/task.entity';
import { TaskService } from '../task/task.service';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private readonly checklistRepo: Repository<Checklist>,

    private readonly taskService: TaskService,
  ) {}

  // 1. Create
  async create(data: any) {
    const { task_id } = data;

    const taskExists = await this.taskService.findOne(task_id);
    if (!taskExists) {
      throw new RpcException({ message: 'Task not found', statusCode: 404 });
    }

    const countChecklist = await this.checklistRepo.count({
      where: { task_id: task_id },
    });

    const newChecklist = this.checklistRepo.create({
      ...data,
      position: countChecklist + 1,
    });

    return await this.checklistRepo.save(newChecklist);
  }

  async findAllByTask(taskId: string) {
    return await this.checklistRepo.find({
      where: { task_id: taskId },
      order: { position: 'ASC', id: 'ASC' },
    });
  }

  async update(id: string, data: any) {
    const checklist = await this.checklistRepo.findOne({ where: { id } });
    if (!checklist) {
      throw new RpcException({
        message: 'Checklist not found',
        statusCode: 404,
      });
    }

    Object.assign(checklist, data);
    return await this.checklistRepo.save(checklist);
  }

  // 4. Delete
  async delete(id: string) {
    const checklist = await this.checklistRepo.findOne({ where: { id } });
    if (!checklist) {
      throw new RpcException({
        message: 'Checklist not found',
        statusCode: 404,
      });
    }

    await this.checklistRepo.remove(checklist);
    return { success: true, message: 'Checklist deleted successfully' };
  }
}
