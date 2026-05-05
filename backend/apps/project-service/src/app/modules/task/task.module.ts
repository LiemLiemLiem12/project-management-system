import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { GroupTask } from './entities/group-task.entity';
import { Task } from './entities/task.entity';
import { Label } from './entities/label.entity';
import { ProjectModule } from '../project/project.module';
import { ChecklistModule } from '../checklist/checklist.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupTask, Task, Label]),
    forwardRef(() => ProjectModule),
    forwardRef(() => ChecklistModule),

    // Gắn loa RabbitMQ
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'audit_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),

    ClientsModule.register([
      {
        name: process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_MQ || 'amqp://guest:guest@localhost:5672'],
          queue: process.env.AUTH_QUEUE_NAME || 'AUTH_QUEUE',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService, TypeOrmModule, ClientsModule],
})
export class TaskModule {}
