import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Asset } from './entities/asset.entity';
import { PERMISSION } from './enums/permission.enum';
import { AssetPermission } from './entities/asset-permission.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,

    @InjectRepository(AssetPermission)
    private readonly assetPermissionRepo: Repository<AssetPermission>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(data: any) {
    const newAsset = this.assetRepo.create({
      ...data,
      isDeleted: 0,
      permissions: [
        {
          userId: data.uploadedBy,
          permission: 'READ',
        },
        {
          userId: data.uploadedBy,
          permission: 'DELETE',
        },
        {
          userId: data.uploadedBy,
          permission: 'UPDATE',
        },
        {
          userId: data.uploadedBy,
          permission: 'CREATE',
        },
      ],
    });

    this.assetPermissionRepo.create();

    return await this.assetRepo.save(newAsset);
  }

  async findAllByProject(projectId: string, isRoot: boolean, userId: string) {
    let whereCondition: any = {
      projectId: projectId,
      isDeleted: 0,
    };

    if (isRoot) {
      whereCondition.parentId = IsNull();
    }

    const assets = await this.assetRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      relations: ['permissions'],
    });

    return assets.map((asset) => {
      const hasAccess = asset.permissions.some(
        (p) =>
          p.userId === userId &&
          [PERMISSION.READ].includes(p.permission as PERMISSION),
      );

      if (hasAccess) {
        return { ...asset, canView: true }; // Gắn thêm cờ cho FE dễ xử lý
      } else {
        return {
          ...asset,
          fileSize: 0,
          fileType: null,
          storageUrl: null,
          canView: false, // Thống nhất dùng canView
        };
      }
    });
  }

  async findAllByFolder(id: string, userId: string) {
    const folder = await this.assetRepo.findOne({
      where: { id, isFolder: true, isDeleted: 0 },
      relations: ['permissions'],
    });

    if (!folder) {
      throw new RpcException({
        message: 'Folder is not existed',
        statusCode: 404,
      });
    }

    const assetsInFolder = await this.assetRepo.find({
      where: {
        parent: { id: id },
        isDeleted: 0,
      },
      relations: ['permissions'],
      order: {
        isFolder: 'DESC',
        createdAt: 'DESC',
      },
    });

    const formatPermissionAssets = assetsInFolder.map((asset) => {
      const hasAccess = asset.permissions.some(
        (p) =>
          p.userId === userId &&
          [PERMISSION.READ].includes(p.permission as PERMISSION),
      );

      if (hasAccess) {
        return { ...asset, canView: true };
      } else {
        return {
          ...asset,
          fileSize: 0,
          fileType: null,
          storageUrl: null,
          canView: false,
        };
      }
    });

    return {
      folderInfo: folder,
      children: formatPermissionAssets,
    };
  }

  // 3. Update
  async update(id: string, data: any) {
    const asset = await this.assetRepo.findOne({
      where: { id, isDeleted: 0 },
    });

    if (!asset) {
      throw new RpcException({
        message: 'Asset not found',
        statusCode: 404,
      });
    }

    Object.assign(asset, data);
    return await this.assetRepo.save(asset);
  }

  // 4. Delete
  async delete(id: string) {
    const asset = await this.assetRepo.findOne({
      where: { id, isDeleted: 0 },
    });

    if (!asset) {
      throw new RpcException({
        message: 'Asset not found',
        statusCode: 404,
      });
    }

    if (asset.publicId) {
      await this.cloudinaryService.deleteFile(asset.publicId);
    }

    await this.assetRepo.delete({ id: id });

    return { success: true, message: 'Asset deleted successfully' };
  }
}
