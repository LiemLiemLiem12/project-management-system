import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TaskService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async upload(files: Express.Multer.File[]) {
    return this.cloudinaryService.uploadMultipleFiles(
      files,
      'task_descriptions',
    );
  }
}
