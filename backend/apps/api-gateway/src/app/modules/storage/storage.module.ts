import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  controllers: [StorageController],
  providers: [
    StorageService,
    {
      provide: 'STORAGE_PORT',
      useFactory: (configService: ConfigService) => {
        return configService.get<number>('STORAGE_PORT') || 4001;
      },
      inject: [ConfigService],
    },
    {
      provide: 'STORAGE_HOST',
      useFactory: (configService: ConfigService) => {
        if (configService.get<string>('NODE_ENV') === 'production') {
          return configService.get<string>('STORAGE_HOST') || 'storage-service';
        }
        return 'localhost';
      },
      inject: [ConfigService],
    },
  ],
})
export class StorageModule {}
