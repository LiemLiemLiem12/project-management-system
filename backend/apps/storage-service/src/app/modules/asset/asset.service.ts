import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
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

    @InjectDataSource()
    private readonly dataSource: DataSource,
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

    console.log(assets);

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
      relations: ['permissions', 'parent'],
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
      relations: ['permissions', 'parent'],
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

  async findAllByTaskId(taskId: string, userId: string) {
    let whereCondition: any = {
      taskId: taskId,
      isDeleted: 0,
    };

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

  async checkPermission(fileId: string, userId: string) {
    return this.assetPermissionRepo.find({
      where: { fileId, userId },
    });
  }

  async syncUserPermissions(
    fileId: string,
    userId: string,
    newPermissions: string[],
  ) {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(AssetPermission, { fileId, userId });

      if (newPermissions && newPermissions.length > 0) {
        const permissionsToInsert = newPermissions.map((perm) => {
          return manager.create(AssetPermission, {
            fileId,
            userId,
            permission: perm,
          });
        });
        await manager.save(permissionsToInsert);
      }
    });

    return this.getPermissionsOfUserOnFile(fileId, userId);
  }

  async getPermissionsOfUserOnFile(
    fileId: string,
    userId: string,
  ): Promise<string[]> {
    const records = await this.assetPermissionRepo.find({
      where: {
        fileId: fileId,
        userId: userId,
      },
      select: ['permission'],
    });

    return records.map((record) => record.permission);
  }

  // Get storage usage statistics for a project
  async getStorageUsageByProject(projectId: string) {
    const assets = await this.assetRepo.find({
      where: {
        projectId: projectId,
        isDeleted: 0,
        isFolder: false, // Only count files, not folders
      },
    });

    // Calculate total bytes used
    const usedBytes = assets.reduce(
      (sum, asset) => sum + Number(asset.fileSize),
      0,
    );

    // Group by file type and sum sizes
    const typeMap = new Map<string, number>();
    assets.forEach((asset) => {
      if (asset.fileType) {
        const currentSize = typeMap.get(asset.fileType) || 0;
        typeMap.set(asset.fileType, currentSize + Number(asset.fileSize));
      }
    });

    const breakdown = Array.from(typeMap.entries()).map(([type, bytes]) => ({
      type,
      bytes,
    }));

    // Set max storage to 10GB (10737418240 bytes)
    const maxBytes = 10 * 1024 * 1024 * 1024;

    return {
      usedBytes,
      maxBytes,
      breakdown,
    };
  }

  // Get recent assets for a project (ordered by createdAt DESC)
  async getRecentAssetsByProject(projectId: string, limit: number = 10) {
    const assets = await this.assetRepo.find({
      where: {
        projectId: projectId,
        isDeleted: 0,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['permissions'],
      take: limit,
    });

    // Apply permission filtering
    return assets.map((asset) => {
      return {
        ...asset,
        canView: true, // For recent assets, we show them as viewable
      };
    });
  }
}
