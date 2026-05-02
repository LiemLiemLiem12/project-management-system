import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateStorageDto {
  @IsBoolean()
  @IsOptional()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  projectId!: string;

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
  uploadedBy!: string;
}
