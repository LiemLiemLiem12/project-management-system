import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AssetPermission } from './asset-permission.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  @Column({ type: 'varchar', name: 'name' })
  name!: string;

  @Column({ type: 'boolean', name: 'is_folder', default: false })
  isFolder!: boolean;

  @ManyToOne(() => Asset, (asset) => asset.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Asset;

  @OneToMany(() => AssetPermission, (permission) => permission.file, {
    cascade: true,
  })
  permissions!: AssetPermission[];
  @OneToMany(() => Asset, (asset) => asset.parent)
  children!: Asset[];

  @Column({ type: 'varchar', name: 'task_id', default: 0, nullable: true })
  taskId!: string;

  @Column({ type: 'varchar', name: 'file_type', nullable: true })
  fileType!: string;

  @Column({ type: 'bigint', name: 'file_size', default: 0 })
  fileSize!: number;

  @Column({ type: 'varchar', name: 'storage_url', nullable: true })
  storageUrl!: string;

  @Column({ type: 'varchar', name: 'public_id', nullable: true })
  publicId!: string;

  @Column({ type: 'varchar', name: 'uploaded_by' })
  uploadedBy!: string;

  @Column({ type: 'int', name: 'is_deleted', default: 0 })
  isDeleted!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
