import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import FormData from 'form-data';
import { AssetPermissionGrant } from './decorators/asset-permission.decorator';
import { AssetPermission } from './enums/asset-permission.enum';
import { AssetPermissionGuard } from './guard/asset-permission.guard';
import { SyncUserPermissionDto } from './dto/sync-user-permission.dto';

@Controller('storages')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @AssetPermissionGrant(AssetPermission.UPDATE)
  @UseGuards(AssetPermissionGuard)
  @UseGuards(JwtAuthGuard)
  @Post('role')
  syncUserPermission(@Body() body: SyncUserPermissionDto) {
    return this.storageService.syncUserPermission(
      body.fileId,
      body.userId,
      body.newPermissions,
    );
  }

  @AssetPermissionGrant(AssetPermission.CREATE)
  @UseGuards(AssetPermissionGuard)
  @UseGuards(JwtAuthGuard)
  @Post('folder')
  createFolder(@Body() body: CreateFolderDto, @Req() request: Request) {
    const user = request.user as { userId: string; username: string };

    const payload = {
      ...body,
      name: body.name ? body.name : 'New Folder',
      isFolder: true,
      fileSize: 0,
      uploadedBy: user.userId,
    };
    return this.storageService.createFolder(payload);
  }

  @Post()
  @AssetPermissionGrant(AssetPermission.CREATE)
  @UseGuards(JwtAuthGuard, AssetPermissionGuard)
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() createStorageDto: CreateStorageDto,
    @Query('parentId') parentId: string,
    @Req() request: Request,
  ) {
    const user = request.user as { userId: string; username: string };

    return this.storageService.createAsset({
      ...createStorageDto,
      uploadedBy: user.userId,
      parentId: parentId ? parentId : null,
      files,
    });
  }

  @AssetPermissionGrant(AssetPermission.READ)
  @UseGuards(JwtAuthGuard, AssetPermissionGuard)
  @Get('folder/:fileId')
  getAssetsByFolder(@Param('fileId') fileId: string, @Req() request: Request) {
    const user = request.user as { userId: string; username: string };
    if (!user) return false;
    return this.storageService.getAssetsByFolder(fileId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage/:projectId')
  getStorageUsage(@Param('projectId') projectId: string) {
    return this.storageService.getStorageUsage(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent/:projectId')
  getRecentAssets(
    @Param('projectId') projectId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.storageService.getRecentAssets(projectId, parseInt(limit, 10));
  }

  @AssetPermissionGrant(AssetPermission.READ)
  @UseGuards(JwtAuthGuard, AssetPermissionGuard)
  @Get('project/:projectId')
  getAssetsByProject(
    @Param('projectId') projectId: string,
    @Query('isRoot') isRoot: boolean,
    @Req() request: Request,
  ) {
    const user = request.user as { userId: string; username: string };

    return this.storageService.getAssetsByProject(
      projectId,
      user.userId,
      isRoot,
    );
  }

  @AssetPermissionGrant(AssetPermission.READ)
  @UseGuards(JwtAuthGuard, AssetPermissionGuard)
  @Get('task/:taskId')
  getAssetsByTaskId(@Param('taskId') taskId: string, @Req() request: Request) {
    const user = request.user as { userId: string; username: string };

    return this.storageService.getAssetsByTaskId(taskId, user.userId);
  }

  @AssetPermissionGrant(AssetPermission.UPDATE)
  @UseGuards(JwtAuthGuard, AssetPermissionGuard)
  @Patch(':fileId')
  update(
    @Param('fileId') fileId: string,
    @Body() updateStorageDto: UpdateStorageDto,
  ) {
    return this.storageService.updateAsset(fileId, updateStorageDto);
  }

  @AssetPermissionGrant(AssetPermission.DELETE)
  @UseGuards(JwtAuthGuard, AssetPermissionGuard)
  @Delete(':fileId')
  remove(@Param('fileId') fileId: string) {
    return this.storageService.deleteAsset(fileId);
  }
}
