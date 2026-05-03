import { Module } from '@nestjs/common';
import { ProjectService } from './services/project.service';
import { ProjectController } from './controllers/project.controller';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { AuthModule } from '../auth/auth.module';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { ChecklistController } from './controllers/checklist.controller';
import { ChecklistService } from './services/checklist.service';
import { LabelController } from './controllers/label.controller';
import { LabelService } from './services/label.service';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { HttpModule } from '@nestjs/axios';
import { CommentGateway } from './gateways/comment.gateway';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    ClientsModule.register([
      {
        name: process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_MQ || 'amqp://localhost:5672'],
          queue: process.env.PROJECT_QUEUE_NAME || 'PROJECT_QUEUE',
          queueOptions: {
            durable: false,
          },
        },
      },

      {
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_MQ || 'amqp://localhost:5672'],
          queue: process.env.AUDIT_QUEUE_NAME || 'audit_queue',
          queueOptions: {
            durable: true,
          },
        },
      },

      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_MQ || 'amqp://localhost:5672'],
          queue: process.env.AUTH_QUEUE_NAME || 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    ProjectController,
    TaskController,
    ChecklistController,
    LabelController,
    CommentController,
  ],
  providers: [
    ProjectService,
    TaskService,
    ChecklistService,
    LabelService,
    CommentService,
    CommentGateway,
  ],
})
export class ProjectModule {}
