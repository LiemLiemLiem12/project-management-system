import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_medias')
export class CommentMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  comment_id!: string;

  @Column()
  file_name!: string;

  @Column()
  file_url!: string;

  @Column()
  file_type!: string;

  @Column('float')
  file_size!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Comment, (c) => c.medias)
  @JoinColumn({ name: 'comment_id' })
  comment!: Comment;
}
