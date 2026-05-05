import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './modules/notification/notification.module';
import { Notification } from './modules/notification/entities/notification.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    NotificationModule,

    ConfigModule.forRoot({
      envFilePath: '.env.local',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',

      database: process.env.DATABASE_NAME || 'notificationdb',
      entities: [Notification],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
