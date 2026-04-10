import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentMedia } from './entities/comment-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentMedia])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
