import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Brackets } from 'typeorm';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { Task } from './entities/task.entity';
import { GroupTask } from './entities/group-task.entity';
import { Label } from './entities/label.entity';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs/internal/operators/catchError';
import { timeout } from 'rxjs/internal/operators/timeout';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { of } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(GroupTask)
    private readonly groupTaskRepo: Repository<GroupTask>,

    @InjectRepository(Label)
    private readonly labelRepo: Repository<Label>,

    @Inject(process.env.AUDIT_SERVICE_NAME || 'AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,

    @Inject('NOTIFICATION_SERVICE_CLIENT')
    private readonly notifClient: ClientProxy,

    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,
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
        avatar: user?.avatarUrl || user?.avatar || user?.avatar_url || null,
      };
    } catch (error) {
      return { name: 'Hệ thống', avatar: null };
    }
  }

  async findOne(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: ['groupTask', 'labels', 'subtasks', 'checklists', 'parent'],
      order: {
        checklists: {
          position: 'ASC',
        },
      },
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
          }).orWhere('task.task_id LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      )
      .select(['task.id', 'task.task_id', 'task.title'])
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
    start_date?: string;
    description?: string;
    due_date?: string | Date;
    assignee_id?: string;
    label_ids?: string[];
    parent_id?: string;
  }) {
    const maxPosTask = await this.taskRepository.findOne({
      where: { group_task_id: payload.group_task_id },
      order: { position: 'DESC' },
    });
    const position = maxPosTask ? maxPosTask.position + 1 : 1;

    // Quét tìm ID lớn nhất để không bị trùng lặp
    const existingTasks = await this.taskRepository
      .createQueryBuilder('task')
      .innerJoin('task.groupTask', 'groupTask')
      .where('groupTask.project_id = :projectId', {
        projectId: payload.project_id,
      })
      .select('task.task_id')
      .getMany();

    let maxNumber = 0;
    existingTasks.forEach((t) => {
      const parts = t.task_id.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextIdValue = `task-${maxNumber + 1}`;

    let labels: Label[] = [];
    if (payload.label_ids?.length) {
      labels = await this.labelRepo.findBy({ id: In(payload.label_ids) });
    }

    const task = this.taskRepository.create({
      ...payload,
      task_id: nextIdValue,
      position,
      labels,
    });

    const newTask = await this.taskRepository.save(task);

    // Bắn event giao task (nếu có người nhận luôn lúc tạo)
    if (newTask.assignee_id && newTask.assignee_id !== payload.created_by) {
      const senderInfo = await this.getSenderInfo(payload.created_by);
      this.notifClient.emit('notify.task_assigned', {
        recipientId: newTask.assignee_id,
        senderId: payload.created_by,
        senderName: senderInfo.name,
        senderAvatar: senderInfo.avatar,
        projectId: payload.project_id,
        taskId: newTask.id,
        taskName: newTask.title,
      });
    }

    this.auditClient.emit('log_action_created', {
      project_id: payload.project_id,
      user_id: payload.created_by || 'unknown_user',
      action: 'CREATE_TASK',
      entity_type: 'TASK',
      entity_id: newTask.id,
      old_value: null,
      new_value: newTask,
    });

    return newTask;
  }

  async update(id: string, data: any, currentUserId: string = 'unknown_user') {
    const task = await this.findTaskById(id);
    const oldTask = JSON.parse(JSON.stringify(task));

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

    const isAssigneeChanged =
      data.assignee_id !== undefined && data.assignee_id !== task.assignee_id;

    Object.assign(task, data);
    const newTask = await this.taskRepository.save(task);

    // Bắn event đổi người nhận task
    if (
      isAssigneeChanged &&
      newTask.assignee_id &&
      newTask.assignee_id !== currentUserId
    ) {
      const senderInfo = await this.getSenderInfo(currentUserId);
      this.notifClient.emit('notify.task_assigned', {
        recipientId: newTask.assignee_id,
        senderId: currentUserId,
        senderName: senderInfo.name,
        senderAvatar: senderInfo.avatar,
        projectId: task.groupTask?.project_id,
        taskId: newTask.id,
        taskName: newTask.title,
      });
    }

    this.auditClient.emit('log_action_created', {
      project_id: task.groupTask?.project_id,
      user_id: currentUserId,
      action: 'UPDATE_TASK',
      entity_type: 'TASK',
      entity_id: id,
      old_value: oldTask,
      new_value: newTask,
    });

    return newTask;
  }

  async moveTask(
    payload: { id: string; group_task_id: string; position: number },
    currentUserId: string = 'unknown_user',
  ) {
    const task = await this.findTaskById(payload.id);
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

    // 🚀 LOG: MOVE TASK
    this.auditClient.emit('log_action_created', {
      project_id: task.groupTask?.project_id,
      user_id: currentUserId,
      action: 'MOVE_TASK',
      entity_type: 'TASK',
      entity_id: task.id,
      old_value: { group_task_id: oldGroupId, position: oldPos },
      new_value: { group_task_id: newGroupId, position: newPos },
    });

    return task;
  }

  async remove(id: string, currentUserId: string = 'unknown_user') {
    const task = await this.findTaskById(id);

    const oldTask = JSON.parse(JSON.stringify(task));

    const result = await this.taskRepository.remove(task);

    // 🚀 LOG: DELETE TASK
    this.auditClient.emit('log_action_created', {
      project_id: task.groupTask?.project_id, // Đã thêm project_id
      user_id: currentUserId,
      action: 'DELETE_TASK',
      entity_type: 'TASK',
      entity_id: id,
      old_value: oldTask,
      new_value: null,
    });

    this.auditClient.emit('audit.delete', {
      entityId: id,
    });

    return result;
  }

  async archive(id: string) {
    await this.taskRepository.update(id, { is_archived: true });
    return { success: true };
  }

  // ─── GROUP TASKS ──────────────────────────────────────────────────────────

  // 🚀 Thêm currentUserId
  async createGroup(
    payload: { project_id: string; title: string },
    currentUserId: string = 'unknown_user',
  ) {
    const maxOrder = await this.groupTaskRepo.findOne({
      where: { project_id: payload.project_id },
      order: { order: 'DESC' },
    });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const group = this.groupTaskRepo.create({ ...payload, order });
    const savedGroup = await this.groupTaskRepo.save(group);

    // 🚀 LOG: CREATE GROUP
    this.auditClient.emit('log_action_created', {
      project_id: payload.project_id,
      user_id: currentUserId,
      action: 'CREATE_GROUP',
      entity_type: 'GROUP_TASK',
      entity_id: savedGroup.id,
      old_value: null,
      new_value: savedGroup,
    });

    return savedGroup;
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

  // 🚀 Thêm currentUserId
  async removeGroup(id: string, currentUserId: string = 'unknown_user') {
    const group = await this.groupTaskRepo.findOne({ where: { id } });
    if (!group)
      throw new RpcException({
        message: `GroupTask ${id} not found`,
        statusCode: 404,
      });

    const oldGroup = JSON.parse(JSON.stringify(group));
    const result = await this.groupTaskRepo.remove(group);

    // 🚀 LOG: DELETE GROUP
    this.auditClient.emit('log_action_created', {
      project_id: oldGroup.project_id,
      user_id: currentUserId,
      action: 'DELETE_GROUP',
      entity_type: 'GROUP_TASK',
      entity_id: id,
      old_value: oldGroup,
      new_value: null,
    });

    return result;
  }

  async reorderGroups(projectId: string, ordered_ids: string[]) {
    await Promise.all(
      ordered_ids.map((id, index) =>
        this.groupTaskRepo.update(id, { order: index }),
      ),
    );
    return this.getKanbanBoard(projectId);
  }

  // 🚀 Thêm currentUserId
  async removeGroupWithFallback(
    id: string,
    fallbackGroupId: string,
    currentUserId: string = 'unknown_user',
  ) {
    const group = await this.groupTaskRepo.findOne({ where: { id } });
    if (!group)
      throw new RpcException({
        message: `GroupTask ${id} not found`,
        statusCode: 404,
      });

    const oldGroup = JSON.parse(JSON.stringify(group));

    // ── Không được xóa cột cuối cùng ──────────────────────────────────────────
    const totalGroups = await this.groupTaskRepo.count({
      where: { project_id: group.project_id },
    });
    if (totalGroups <= 1)
      throw new RpcException({
        message: 'Cannot delete the last column',
        statusCode: 400,
      });

    // ── Nếu cột bị xóa là isSuccess, cột fallback phải nhận task (không block) ─
    const fallback = await this.groupTaskRepo.findOne({
      where: { id: fallbackGroupId },
    });
    if (!fallback)
      throw new RpcException({
        message: `Fallback GroupTask ${fallbackGroupId} not found`,
        statusCode: 404,
      });

    // ── Chuyển toàn bộ task sang fallback ─────────────────────────────────────
    const maxPosTask = await this.taskRepository.findOne({
      where: { group_task_id: fallbackGroupId },
      order: { position: 'DESC' },
    });
    const basePosition = maxPosTask ? maxPosTask.position + 1 : 0;

    const tasksToMove = await this.taskRepository.find({
      where: { group_task_id: id },
      order: { position: 'ASC' },
    });

    if (tasksToMove.length > 0) {
      await Promise.all(
        tasksToMove.map((task, i) =>
          this.taskRepository.update(task.id, {
            group_task_id: fallbackGroupId,
            position: basePosition + i,
          }),
        ),
      );
    }

    // ── Nếu cột bị xóa là isSuccess → chuyển isSuccess sang fallback ──────────
    if (group.isSuccess) {
      await this.groupTaskRepo.update(fallbackGroupId, { isSuccess: true });
    }

    await this.groupTaskRepo.remove(group);

    // 🚀 LOG: DELETE GROUP (có fallback chuyển task)
    this.auditClient.emit('log_action_created', {
      project_id: oldGroup.project_id,
      user_id: currentUserId,
      action: 'DELETE_GROUP',
      entity_type: 'GROUP_TASK',
      entity_id: id,
      old_value: oldGroup,
      new_value: { fallback_group_id: fallbackGroupId },
    });

    return { success: true };
  }

  // ─── LABEL ────────────────────────────────────────────────────────────────

  async createLabel(data: {
    project_id: string;
    name: string;
    color_code: string;
  }) {
    const newLabel = this.labelRepo.create(data);
    return await this.labelRepo.save(newLabel);
  }

  async findAllLabelByProject(projectId: string) {
    return await this.labelRepo.find({
      where: { project_id: projectId },
      order: { name: 'ASC' },
    });
  }

  async updateLabel(id: string, data: any) {
    const label = await this.labelRepo.findOne({ where: { id } });

    if (!label) {
      throw new RpcException({ message: 'Label not found', statusCode: 404 });
    }

    Object.assign(label, data);
    return await this.labelRepo.save(label);
  }

  async deleteLabel(id: string) {
    const label = await this.labelRepo.findOne({ where: { id } });

    if (!label) {
      throw new RpcException({ message: 'Label not found', statusCode: 404 });
    }

    await this.labelRepo.remove(label);
    return { success: true, message: 'Label deleted successfully' };
  }

  async getTasks(projectId: string) {
    const groupTasks = await this.groupTaskRepo.find({
      where: { project_id: projectId },
      relations: {
        tasks: { labels: true, checklists: true, subtasks: true },
      },
      order: {
        order: 'ASC',
        tasks: {
          position: 'ASC',
        },
      },
    });

    const allTasks = groupTasks.flatMap((group) => group.tasks);

    return { tasks: allTasks };
  }

  async getLogsFromAudit() {
    return this.auditClient.send('get_recent_logs', {});
  }

  async findMyTasks(userId: string) {
    const tasks = await this.taskRepository.find({
      where: {
        assignee_id: userId,
        is_archived: false,
      },
      relations: ['groupTask'],
    });

    return tasks.map((task) => ({
      ...task,
      groupTitle: task.groupTask?.title || 'Unknown',
      isSuccess: task.groupTask?.isSuccess || false,
    }));
  }
}
