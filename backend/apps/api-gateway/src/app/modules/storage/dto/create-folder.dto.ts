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
  name?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  projectId!: string;
}
