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
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
