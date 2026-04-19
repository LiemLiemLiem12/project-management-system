import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity'; // Đường dẫn tới file task entity

@Entity('checklists')
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ default: false })
  is_completed!: boolean;

  @Column()
  position!: number;

  @Column({ type: 'uuid' })
  task_id!: string;

  @ManyToOne(() => Task, (task) => task.checklists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task!: Task;
}
