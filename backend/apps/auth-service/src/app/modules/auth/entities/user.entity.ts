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

  @Column({ unique: false })
  username!: string;

  @Column({ unique: true })
  email!: string;
  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'full_name', nullable: true })
  fullName!: string;

  @Column({ name: 'avatar_url', type: 'longtext', nullable: true })
  avatarUrl!: string;

  @Column({ default: 'local' })
  provider!: string;

  @Column({ name: 'birthday', type: 'date', default: null })
  birthday!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
