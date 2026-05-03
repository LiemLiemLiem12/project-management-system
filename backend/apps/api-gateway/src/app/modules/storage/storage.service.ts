import { Injectable, Inject, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { AssetPermission } from './enums/asset-permission.enum';

@Injectable()
export class StorageService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject('STORAGE_PORT') private readonly PORT: number,
  ) {
    this.baseUrl = `http://localhost:${this.PORT}/assets`;
  }

  private async request(method: string, url: string, data?: any) {
    try {
      const response = await firstValueFrom(
        method === 'get' || method === 'delete'
          ? this.httpService.request({ method, url, params: data })
          : this.httpService.request({ method, url, data }),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;

        console.error(`[Storage Service Error ${statusCode}]:`, errorData);

        throw new HttpException(errorData, statusCode);
      }
    }
  }

  async createAsset(payload: any) {
    const formData = new FormData();

    const { files, ...textFields } = payload;

    Object.keys(textFields).forEach((key) => {
      if (textFields[key] !== undefined && textFields[key] !== null) {
        formData.append(key, String(textFields[key]));
      }
    });

    if (files && files.length > 0) {
      files.forEach((file: Express.Multer.File) => {
        formData.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    return await this.request('post', this.baseUrl, formData);
  }

  createFolder(payload: any) {
    return this.request('post', `${this.baseUrl}/folder`, payload);
  }

  getAssetsByFolder(id: string, userId: string) {
    return this.request('get', `${this.baseUrl}/folder`, { id, userId });
  }

  getAssetsByProject(
    projectId: string,
    userId: string,
    isRoot: boolean = true,
  ) {
    return this.request('get', `${this.baseUrl}`, {
      projectId,
      userId,
      isRoot,
    });
  }

  updateAsset(id: string, payload: any) {
    return this.request('patch', `${this.baseUrl}/${id}`, payload);
  }

  deleteAsset(id: string) {
    return this.request('delete', `${this.baseUrl}/${id}`);
  }

  checkPermission(fileId: string, userId: string) {
    return this.request('get', `${this.baseUrl}/role`, {
      fileId,
      userId,
    });
  }

  syncUserPermission(fileId: string, userId: string, newPermissions: any[]) {
    return this.request('post', `${this.baseUrl}/role`, {
      fileId,
      userId,
      newPermissions,
    });
  }
}
