import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './modules/mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { User } from './modules/auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'authdb',
      entities: [User],
      synchronize: true,
      autoLoadEntities: true,
    }),

    AuthModule,

    MailModule,

    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
