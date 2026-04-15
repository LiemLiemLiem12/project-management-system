import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { AuthModule } from '../auth/auth.module';

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
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
