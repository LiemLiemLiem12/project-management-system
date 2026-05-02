import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  project_id!: string;

  @Column({ type: 'varchar', length: 255 })
  user_id!: string;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'varchar', length: 100 })
  entity_type!: string;

  @Column({ type: 'varchar', length: 255 })
  entity_id!: string;

  @Column({ type: 'text', nullable: true })
  old_value!: string;

  @Column({ type: 'text', nullable: true })
  new_value?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'varchar', length: 50, default: 'SUCCESS' })
  status?: string;
}
