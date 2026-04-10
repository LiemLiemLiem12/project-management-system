import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  project_id!: string;

  @Column()
  name!: string;

  @Column()
  color_code!: string;

  @ManyToOne(() => Project, (project) => project.labels)
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
