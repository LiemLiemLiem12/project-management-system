import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { MemberTalent } from './member-talent.entity';

@Entity('project_members')
export class ProjectMember {
  @PrimaryColumn('uuid')
  project_id!: string;

  @PrimaryColumn('uuid')
  user_id!: string;

  @Column({ type: 'enum', enum: ['Leader', 'Member', 'Moderator'] })
  role!: string;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Active', 'Declined'],
    default: 'Pending',
  })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  invite_token!: string | null;

  @CreateDateColumn()
  joined_date!: Date;

  @ManyToOne(() => Project, (project) => project.members)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @OneToMany(() => MemberTalent, (mt) => mt.projectMember)
  talents!: MemberTalent[];
}
