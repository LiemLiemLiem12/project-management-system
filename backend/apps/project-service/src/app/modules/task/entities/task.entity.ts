import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupTask } from './group-task.entity';
import { Label } from './label.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
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
  due_date!: Date;

  @Column()
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
}
