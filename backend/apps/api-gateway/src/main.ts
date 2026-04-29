/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  const configService = app.get(ConfigService);

  const globalPrefix = configService.get('GLOBAL_PREFIX') || 'api';
  const port = configService.get('API_GATEWAY_PORT') || 4000;
  app.setGlobalPrefix(globalPrefix);

  const origins = [
    configService.get('FRONTEND_ORIGIN') || 'http://localhost:3000',
    configService.get('CORS_ORIGIN') || 'http://localhost:4001',
  ];

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.use(cookieParser.default());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(port);
  Logger.log(
    `[API Gateway] is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
