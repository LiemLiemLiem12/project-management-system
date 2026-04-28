/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4001;
  const ServiceName = process.env.STORAGE_SERVICE_NAME || 'STORAGE_SERVICE';

  await app.listen(port);

  Logger.log(`${ServiceName} is running on: http://localhost:${port}`);
}

bootstrap();
