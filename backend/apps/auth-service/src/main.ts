/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config/dist/config.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const configService = appContext.get(ConfigService);

  const RABBIT_MQ =
    configService.get<string>('RABBIT_MQ') ||
    'amqp://guest:guest@localhost:5672';

  const QUEUE_NAME = configService.get<string>('QUEUE_NAME') || 'auth_queue';

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [RABBIT_MQ],
      queue: QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();

  Logger.log(
    `[Auth Service] is running and connected to RabbitMQ at: ${RABBIT_MQ}, listening on queue: ${QUEUE_NAME}`,
  );
}

bootstrap();
