// src/ai/entities/vector-mapping.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('comment_vectors')
export class CommentVector {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  pageContent!: string;

  @Column({ type: 'jsonb' })
  metadata!: Record<string, any>;

  @Column({ type: 'vector', length: 3072 })
  embedding!: number[];
}
