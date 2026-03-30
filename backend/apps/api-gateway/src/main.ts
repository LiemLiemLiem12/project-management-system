/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config/dist/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const globalPrefix = configService.get('GLOBAL_PREFIX') || 'api';
  const port = configService.get('API_GATEWAY_PORT') || 4000;
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port);
  Logger.log(
    `[API Gateway] is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
