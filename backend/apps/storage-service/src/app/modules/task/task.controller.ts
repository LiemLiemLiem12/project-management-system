import {
  BadRequestException,
  Controller,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 1024 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        const allowedTypes = /jpg|jpeg|png|webp|gif|mp4|avi|mkv|mov|webm/i;

        const ext = extname(file.originalname).toLowerCase();
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(ext);

        if (mimeType && extName) {
          return callback(null, true);
        }

        callback(
          new BadRequestException(
            'Only accept media types (jpg, png, webp, gif, mp4, avi, mkv, mov, webm)!',
          ),
          false,
        );
      },
    }),
  )
  async uploadMedia(@UploadedFiles() files: Express.Multer.File) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file has been uploaded!');
    }

    try {
      const uploadedFiles = await this.taskService.upload(files);
      return {
        message: 'Upload SuccessFully',
        files: uploadedFiles,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new ServiceUnavailableException(
        'Failure when uploading to Cloudinary',
      );
    }
  }
}
