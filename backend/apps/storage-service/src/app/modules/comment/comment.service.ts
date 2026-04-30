import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CommentService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImages(files: Express.Multer.File[]) {
    return this.cloudinaryService.uploadMultipleFiles(files, 'comment_assets');
  }

  async deleteImages(publicIds: string[]) {
    return this.cloudinaryService.deleteMultipleFiles(publicIds);
  }
}
