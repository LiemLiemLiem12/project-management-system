import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;
  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'full_name', nullable: true })
  fullName!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl!: string;

  @Column({ default: 'local' }) // Mặc định là local nếu không phải google/fb
  provider!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
