import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectMember } from './project-member.entity';
import { TalentLabel } from './talent-label.entity';
import { GroupTask } from '../../task/entities/group-task.entity';
import { Label } from '../../task/entities/label.entity';

// project.entity.ts
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  status!: string;

  @CreateDateColumn()
  created_date!: Date;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members!: ProjectMember[];

  @OneToMany(() => TalentLabel, (talent) => talent.project)
  talentLabels!: TalentLabel[];

  @OneToMany(() => GroupTask, (group) => group.project)
  groupTasks!: GroupTask[];

  @OneToMany(() => Label, (group) => group.project)
  labels!: Label[];
}
