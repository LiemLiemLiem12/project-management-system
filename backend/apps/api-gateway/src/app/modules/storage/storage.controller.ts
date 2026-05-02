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
} from '@nestjs/common';
import type { Request } from 'express';
import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import FormData from 'form-data';

@Controller('storages')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

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
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(JwtAuthGuard)
  create(
    @UploadedFiles() files: Express.Multer.File,
    @Body() createStorageDto: CreateStorageDto,
    @Req() request: Request,
  ) {
    const user = request.user as { userId: string; username: string };

    return this.storageService.createAsset({
      ...createStorageDto,
      uploadedBy: user.userId,
      files,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('folder/:id')
  getAssetsByFolder(@Param('id') id: string, @Req() request: Request) {
    const user = request.user as { userId: string; username: string };
    if (!user) return false;
    return this.storageService.getAssetsByFolder(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('project')
  getAssetsByProject(
    @Param('projectId') id: string,
    @Query('isRoot') isRoot: boolean,
    @Req() request: Request,
  ) {
    const projectId = request.cookies['projectId'];
    const user = request.user as { userId: string; username: string };

    return this.storageService.getAssetsByProject(id, user.userId, isRoot);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStorageDto: UpdateStorageDto) {
    return this.storageService.updateAsset(id, updateStorageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageService.deleteAsset(id);
  }
}
