import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { MemberTalent } from './member-talent.entity';

@Entity('talent_labels')
export class TalentLabel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  project_id!: string;

  @Column()
  name!: string;

  @Column()
  color_code!: string;

  @ManyToOne(() => Project, (project) => project.talentLabels)
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @OneToMany(() => MemberTalent, (mt) => mt.talentLabel)
  memberTalents!: MemberTalent[];
}
