import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentVector } from './entities/comment-vector.entity';
import { ConfigModule } from '@nestjs/config';
import { RagController } from './rag.controller';
import geminiConfig from './config/gemini.config';
import { CommentModule } from '../comment/comment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [CommentVector],
      process.env.PG_ID_NAME || 'postgres_vector_db',
    ),
    ConfigModule.forFeature(geminiConfig),
    ClientsModule.register([
      {
        name: process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE',
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
    CommentModule,
  ],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
