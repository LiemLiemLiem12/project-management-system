import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { CommentModule } from './modules/comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './modules/comment/entities/comment.entity';
import { CommentMedia } from './modules/comment/entities/comment-media.entity';
import { Project } from './modules/project/entities/project.entity';
import { MemberTalent } from './modules/project/entities/member-talent.entity';
import { ProjectMember } from './modules/project/entities/project-member.entity';
import { TalentLabel } from './modules/project/entities/talent-label.entity';
import { GroupTask } from './modules/task/entities/group-task.entity';
import { Label } from './modules/task/entities/label.entity';
import { Task } from './modules/task/entities/task.entity';

@Module({
  imports: [
    ProjectModule,
    TaskModule,
    CommentModule,

    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'projectdb',
      entities: [
        Comment,
        CommentMedia,
        Project,
        MemberTalent,
        ProjectMember,
        TalentLabel,
        GroupTask,
        Label,
        Task,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
