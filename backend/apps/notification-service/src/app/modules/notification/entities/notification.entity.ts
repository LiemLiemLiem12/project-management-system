import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_id', type: 'varchar' })
  recipientId!: string; // ID của người nhận thông báo

  @Column({ name: 'sender_id', type: 'varchar', nullable: true })
  senderId!: string; // Có thể null nếu là thông báo từ hệ thống tự động

  // 🚀 Snapshot Data để UI render ngay lập tức không cần join
  @Column({ name: 'sender_name', type: 'varchar', nullable: true })
  senderName!: string;

  @Column({ name: 'sender_avatar', type: 'text', nullable: true })
  senderAvatar!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId!: string;

  @Column({ name: 'project_name', type: 'varchar', nullable: true })
  projectName!: string;

  @Column({ name: 'redirect_url', type: 'varchar', nullable: true })
  redirectUrl!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
