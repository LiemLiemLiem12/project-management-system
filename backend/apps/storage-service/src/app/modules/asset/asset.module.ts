import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetPermission } from './entities/asset-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetPermission])],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
