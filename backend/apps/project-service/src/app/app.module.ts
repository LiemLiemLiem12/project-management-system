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
import { ChecklistModule } from './modules/checklist/checklist.module';
import { Checklist } from './modules/checklist/entities/checklist.entity';
import { RagModule } from './modules/rag/rag.module';
import { CommentVector } from './modules/rag/entities/comment-vector.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ProjectModule,
    TaskModule,
    CommentModule,
    MailModule,

    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),

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
        Checklist,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      name: process.env.PG_ID_NAME || 'postgres_vector_db',
      host: process.env.PG_HOST || 'localhost',
      port: 5432,
      username: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'postgres',
      database: process.env.PG_NAME || 'root',
      entities: [CommentVector],
      synchronize: true,
    }),

    ChecklistModule,
    RagModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
