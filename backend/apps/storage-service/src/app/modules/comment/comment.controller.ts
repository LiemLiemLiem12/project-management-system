import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiErrorResponse } from 'cloudinary';
import { DeleteFilesDto } from './dto/delete-files.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 100 * 1024 * 1024 },

      fileFilter: (req, file, callback) => {
        const allowedTypes = /jpg|jpeg|png|webp|gif/;
        const ext = extname(file.originalname).toLowerCase();
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(ext);

        if (mimeType && extName) {
          return callback(null, true);
        }
        callback(
          new BadRequestException(
            'Only accept image type (jpg, png, webp, gif)!',
          ),
          false,
        );
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file has been uploaded!');
    }

    try {
      const uploadedFiles = await this.commentService.uploadImages(files);

      return {
        success: true,
        message: 'Upload images successfully',
        files: uploadedFiles,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new BadRequestException('Failure when uploading to Cloudinary');
    }
  }

  @Delete('images')
  async deleteImages(@Body() body: DeleteFilesDto) {
    const { publicIds } = body;

    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException(
        'Please provide an array of publicIds to delete!',
      );
    }

    try {
      const result = await this.commentService.deleteImages(publicIds);

      return {
        success: true,
        message: 'Delete files successfully',
        data: result,
      };
    } catch (error: any) {
      console.error(error?.message);
      throw new BadRequestException(
        error?.message || 'Failure when deleting files from Cloudinary',
      );
    }
  }
}
