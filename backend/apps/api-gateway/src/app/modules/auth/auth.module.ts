import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';
import facebookOauthConfig from './config/facebook-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
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

    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(facebookOauthConfig),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    UserService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
