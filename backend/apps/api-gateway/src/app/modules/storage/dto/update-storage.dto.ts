import { PartialType } from '@nestjs/mapped-types';
import { CreateStorageDto } from './create-storage.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStorageDto {
  @IsString()
  @IsOptional()
  parentId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  isFolder?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  storageUrl?: string;

  @IsOptional()
  @IsString()
  publicId?: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
