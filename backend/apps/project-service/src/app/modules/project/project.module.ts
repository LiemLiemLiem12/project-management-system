import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberTalent } from './entities/member-talent.entity';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { TaskModule } from '../task/task.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberTalent, Project, ProjectMember]),
    forwardRef(() => TaskModule),

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
          urls: [process.env.RABBIT_MQ || 'amqp://guest:guest@localhost:5672'],
          queue: process.env.NOTIFICATION_QUEUE_NAME || 'NOTIFICATION_QUEUE',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
