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
  constructor(
    file_name: string,
    file_url: string,
    file_type: string,
    file_size: number,
    public_id: string,
  ) {
    this.file_name = file_name;
    this.file_url = file_url;
    this.file_type = file_type;
    this.file_size = file_size;
    this.public_id = public_id;
  }

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

  @IsNotEmpty()
  public_id!: string;
}
