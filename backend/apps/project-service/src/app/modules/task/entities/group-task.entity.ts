import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { Task } from './task.entity';

@Entity('group_tasks')
export class GroupTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  project_id!: string;

  @Column()
  title!: string;

  @Column()
  order!: number;

  @Column({ default: false })
  isSuccess!: boolean;

  @ManyToOne(() => Project, (p) => p.groupTasks)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @OneToMany(() => Task, (task) => task.groupTask)
  tasks!: Task[];
}
