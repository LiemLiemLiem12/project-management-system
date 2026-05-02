import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { CommentModule } from './modules/comment/comment.module';
import { TaskModule } from './modules/task/task.module';
import { AssetModule } from './modules/asset/asset.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './modules/asset/entities/asset.entity';
import { AssetPermission } from './modules/asset/entities/asset-permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    CloudinaryModule,
    CommentModule,
    TaskModule,
    AssetModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'projectdb',
      entities: [Asset, AssetPermission],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
