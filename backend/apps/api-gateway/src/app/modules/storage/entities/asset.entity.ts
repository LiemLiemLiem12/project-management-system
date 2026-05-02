import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId!: string;

  @Column({ type: 'varchar', name: 'file_name' })
  fileName!: string;

  @Column({ type: 'varchar', name: 'file_type' })
  fileType!: string;

  @Column({ type: 'varchar', name: 'file_size' })
  fileSize!: string;

  @Column({ type: 'varchar', name: 'storage_url', nullable: true })
  storageUrl!: string;

  @Column({ type: 'varchar', name: 'cloudinary_url', nullable: true })
  cloudinaryUrl!: string;

  @Column({ type: 'varchar', name: 'uploaded_by' })
  uploadedBy!: string;

  @Column({ type: 'varchar', nullable: true })
  metadata!: string;

  @Column({ type: 'int', name: 'is_deleted', default: 0 })
  isDeleted!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
