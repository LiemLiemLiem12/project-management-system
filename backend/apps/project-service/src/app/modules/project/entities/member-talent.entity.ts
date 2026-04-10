import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProjectMember } from './project-member.entity';
import { TalentLabel } from './talent-label.entity';

@Entity('member_talents')
export class MemberTalent {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  talent_label_id!: string;

  @ManyToOne(() => ProjectMember, (pm) => pm.talents)
  @JoinColumn([
    { name: 'project_id', referencedColumnName: 'project_id' },
    { name: 'user_id', referencedColumnName: 'user_id' },
  ])
  projectMember!: ProjectMember;

  @ManyToOne(() => TalentLabel, (tl) => tl.memberTalents)
  @JoinColumn({ name: 'talent_label_id' })
  talentLabel!: TalentLabel;
}
