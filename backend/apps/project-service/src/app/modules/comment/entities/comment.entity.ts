import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentMedia } from './comment-media.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  parent_comment_id!: string;

  @Column()
  task_id!: string;

  @Column()
  project_id!: string;

  @Column()
  user_id!: string;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => CommentMedia, (media) => media.comment)
  medias!: CommentMedia[];
}
