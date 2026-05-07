import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const configService = appContext.get(ConfigService);

  const RABBIT_MQ =
    configService.get<string>('RABBIT_MQ') ||
    'amqp://guest:guest@localhost:5672';

  const QUEUE_NAME = configService.get<string>('QUEUE_NAME') || 'AUDIT_QUEUE';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [RABBIT_MQ],
        queue: QUEUE_NAME,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  Logger.log(
    '[AUDIT SERVICE] is running and listening on queue: ' + QUEUE_NAME,
  );
}

bootstrap();
