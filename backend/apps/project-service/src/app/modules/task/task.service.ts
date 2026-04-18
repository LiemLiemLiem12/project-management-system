import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Brackets } from 'typeorm';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { Task } from './entities/task.entity';
import { GroupTask } from './entities/group-task.entity';
import { Label } from './entities/label.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>, // Giữ nguyên tên của file cũ

    @InjectRepository(GroupTask)
    private readonly groupTaskRepo: Repository<GroupTask>,

    @InjectRepository(Label)
    private readonly labelRepo: Repository<Label>,
  ) {}

  // ─── HÀM CỦA FILE CŨ (GIỮ NGUYÊN 100% LOGIC & MICROSERVICE EXCEPTION) ───

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

  // ─── HÀM TRỢ GIÚP NỘI BỘ (Để các hàm update, move, remove bên dưới xài) ───

  private async findTaskById(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['labels', 'groupTask'],
    });
    if (!task)
      throw new RpcException({
        message: `Task ${id} not found`,
        statusCode: 404,
      });
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
    return await this.groupTaskRepo.find({
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

  // update(id: number, updateTaskDto: UpdateTaskDto) {
  //   return `This action updates a #${id} task`;
  // }

  // ─── KANBAN BOARD ─────────────────────────────────────────────────────────

  async getKanbanBoard(projectId: string) {
    const groups = await this.groupTaskRepo.find({
      where: { project_id: projectId },
      order: { order: 'ASC' },
      relations: ['tasks', 'tasks.labels'],
    });

    return groups.map((group) => ({
      ...group,
      tasks: group.tasks
        .filter((t) => !t.is_archived)
        .sort((a, b) => a.position - b.position),
    }));
  }

  // ─── TASKS ────────────────────────────────────────────────────────────────

  async create(payload: {
    project_id: string;
    group_task_id: string;
    title: string;
    created_by: string;
    description?: string;
    due_date?: Date;
    assignee_id?: string;
    label_ids?: string[];
    parent_id?: string;
  }) {
    const maxPos = await this.taskRepository.findOne({
      where: { group_task_id: payload.group_task_id },
      order: { position: 'DESC' },
    });
    const position = maxPos ? maxPos.position + 1 : 0;

    let nextIdValue: string;
    if (!position) {
      nextIdValue = '1';
    } else {
      nextIdValue = 'task-' + position.toString();
    }
    let labels: Label[] = [];
    if (payload.label_ids?.length) {
      labels = await this.labelRepo.findBy({ id: In(payload.label_ids) });
    }

    const task = this.taskRepository.create({
      ...payload,
      id: nextIdValue,
      position,
      labels,
    });

    return this.taskRepository.save(task);
  }

  async update(id: string, data: any) {
    const task = await this.findTaskById(id); // Dùng hàm nội bộ thay vì findOne
    if (data.label_ids !== undefined) {
      task.labels = data.label_ids?.length
        ? await this.labelRepo.findBy({ id: In(data.label_ids) })
        : [];
      delete data.label_ids;
    }

    if (data.group_task_id) {
      const groupTask = await this.groupTaskRepo.findOne({
        where: { id: data.group_task_id },
      });

      if (!groupTask) {
        throw new RpcException({
          message: 'Group task not found',
          statusCode: 404,
        });
      }

      task.groupTask = groupTask;

      delete data.group_task_id;
    }

    Object.assign(task, data);
    return await this.taskRepository.save(task);
  }

  async moveTask(payload: {
    id: string;
    group_task_id: string;
    position: number;
  }) {
    const task = await this.findTaskById(payload.id); // Dùng hàm nội bộ
    const oldGroupId = task.group_task_id;
    const oldPos = task.position;
    const newGroupId = payload.group_task_id;
    const newPos = payload.position;

    if (oldGroupId === newGroupId) {
      // Di chuyển trong cùng cột
      if (oldPos < newPos) {
        await this.taskRepository
          .createQueryBuilder()
          .update(Task)
          .set({ position: () => 'position - 1' })
          .where(
            'group_task_id = :g AND position > :old AND position <= :new',
            {
              g: oldGroupId,
              old: oldPos,
              new: newPos,
            },
          )
          .execute();
      } else {
        await this.taskRepository
          .createQueryBuilder()
          .update(Task)
          .set({ position: () => 'position + 1' })
          .where(
            'group_task_id = :g AND position >= :new AND position < :old',
            {
              g: oldGroupId,
              old: oldPos,
              new: newPos,
            },
          )
          .execute();
      }
    } else {
      // Sang cột khác — lấp chỗ cũ, mở chỗ mới
      await this.taskRepository
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => 'position - 1' })
        .where('group_task_id = :g AND position > :old', {
          g: oldGroupId,
          old: oldPos,
        })
        .execute();

      await this.taskRepository
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => 'position + 1' })
        .where('group_task_id = :g AND position >= :new', {
          g: newGroupId,
          new: newPos,
        })
        .execute();
    }

    // Cập nhật giá trị mới
    task.group_task_id = newGroupId;
    task.position = newPos;

    await this.taskRepository.update(task.id, {
      group_task_id: newGroupId,
      position: newPos,
    });

    // Trả về dữ liệu đã cập nhật để Gateway nhận được
    return task;
  }

  async remove(id: string) {
    const task = await this.findTaskById(id); // Dùng hàm nội bộ
    return this.taskRepository.remove(task);
  }

  async archive(id: string) {
    await this.taskRepository.update(id, { is_archived: true });
    return { success: true };
  }

  // ─── GROUP TASKS ──────────────────────────────────────────────────────────

  async createGroup(payload: { project_id: string; title: string }) {
    const maxOrder = await this.groupTaskRepo.findOne({
      where: { project_id: payload.project_id },
      order: { order: 'DESC' },
    });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const group = this.groupTaskRepo.create({ ...payload, order });
    return this.groupTaskRepo.save(group);
  }

  async updateGroup(id: string, title: string) {
    const group = await this.groupTaskRepo.findOne({ where: { id } });
    if (!group)
      throw new RpcException({
        message: `GroupTask ${id} not found`,
        statusCode: 404,
      });
    group.title = title;
    return this.groupTaskRepo.save(group);
  }

  async removeGroup(id: string) {
    const group = await this.groupTaskRepo.findOne({ where: { id } });
    if (!group)
      throw new RpcException({
        message: `GroupTask ${id} not found`,
        statusCode: 404,
      });
    return this.groupTaskRepo.remove(group);
  }

  async reorderGroups(projectId: string, ordered_ids: string[]) {
    await Promise.all(
      ordered_ids.map((id, index) =>
        this.groupTaskRepo.update(id, { order: index }),
      ),
    );
    return this.getKanbanBoard(projectId);
  }
}
