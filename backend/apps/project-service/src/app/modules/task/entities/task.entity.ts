import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupTask } from './group-task.entity';
import { Label } from './label.entity';
import { Checklist } from '../../checklist/entities/checklist.entity';

@Entity('tasks')
export class Task {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  parent_id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  position!: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date!: Date;

  @Column({ type: 'timestamp', nullable: true })
  due_date!: Date;

  @Column({ nullable: true })
  assignee_id!: string;

  @Column()
  created_by!: string;

  @Column()
  group_task_id!: string;

  @Column({ default: false })
  is_archived!: boolean;

  @ManyToOne(() => GroupTask, (gt) => gt.tasks)
  @JoinColumn({ name: 'group_task_id' })
  groupTask!: GroupTask;

  @ManyToMany(() => Label)
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'label_id', referencedColumnName: 'id' },
  })
  labels!: Label[];

  @ManyToOne(() => Task, (task) => task.subtasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Task;

  @OneToMany(() => Task, (task) => task.parent)
  subtasks!: Task[];

  @OneToMany(() => Checklist, (checklist) => checklist.task)
  checklists!: Checklist[];
}
