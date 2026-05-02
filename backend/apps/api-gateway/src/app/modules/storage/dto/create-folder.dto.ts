import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsBoolean()
  @IsOptional()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  projectId!: string;
}
