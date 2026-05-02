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
        return configService.get<number>('STORAGE_PORT') || 3000;
      },
      inject: [ConfigService],
    },
  ],
})
export class StorageModule {}
