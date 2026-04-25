import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentMediaDto {
  @IsString()
  @IsNotEmpty()
  file_name!: string;

  @IsString()
  @IsNotEmpty()
  file_url!: string;

  @IsString()
  @IsNotEmpty()
  file_type!: string;

  @IsNumber()
  @IsNotEmpty()
  file_size!: number;
}
