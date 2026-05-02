import { Injectable, BadRequestException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_chunked_stream(
        { folder: folderName, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folderName: string,
  ): Promise<any> {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, folderName),
    );

    const results = await Promise.all(uploadPromises);

    return results.map((res, index) => ({
      file_url: res.secure_url,
      file_name: files[index].originalname,
      file_type: res.format,
      file_size: res.bytes,
      public_id: res.public_id,
    }));
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw new BadRequestException(`Can't delete file: ${result.result}`);
      }

      return result;
    } catch (error: any) {
      throw new BadRequestException(
        `Error delete file on Cloudinary: ${error.message}`,
      );
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<any> {
    if (!publicIds || publicIds.length === 0) return;

    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return result;
    } catch (error: any) {
      throw new BadRequestException(
        `Error delete files on Cloudinary: ${error.message}`,
      );
    }
  }
}
