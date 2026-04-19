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

@Module({
  imports: [
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
    ]),
  ],
  controllers: [ProjectController, TaskController, ChecklistController],
  providers: [ProjectService, TaskService, ChecklistService],
})
export class ProjectModule {}
