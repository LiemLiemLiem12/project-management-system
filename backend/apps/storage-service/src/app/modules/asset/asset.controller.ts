import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { ALLOWED_MIME_TYPES } from './constant/allow-mime.constant';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Get('folder')
  findAllByFolder(@Query('id') id: string, @Query('userId') userId: string) {
    return this.assetService.findAllByFolder(id, userId);
  }

  @Post('folder')
  async createFolder(@Body() payload: any) {
    return this.assetService.create(payload);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 1024 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `File type wasn't supported: ${file.mimetype}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() payload: any,
  ) {
    try {
      if (files && files.length !== 0) {
        const resMedias = await this.cloudinaryService.uploadMultipleFiles(
          files,
          `storage:${payload.projectId}`,
        );

        if (!resMedias || resMedias.length === 0) {
          throw new ServiceUnavailableException('Storage Service is downed');
        }

        const createPromises = resMedias.map((media: any) => {
          return this.assetService.create({
            ...payload,
            name: media.file_name,
            fileType: media.file_type,
            fileSize: media.file_size,
            storageUrl: media.file_url,
            publicId: media.public_id,
            isDeleted: 0,
          });
        });

        const savedAssets = await Promise.all(createPromises);
        return savedAssets;
      } else {
        return this.assetService.create(payload);
      }
    } catch (error) {
      throw error;
    }
  }

  @Get('')
  findAllByProject(
    @Query('projectId') projectId: string,
    @Query('userId') userId: string,
    @Query('isRoot') isRoot: boolean,
  ) {
    return this.assetService.findAllByProject(projectId, isRoot, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.assetService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.assetService.delete(id);
  }
}
