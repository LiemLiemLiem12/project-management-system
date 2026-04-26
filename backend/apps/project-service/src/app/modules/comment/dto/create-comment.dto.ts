import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateCommentMediaDto } from './create-comment-media.dto';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  task_id!: string;

  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsUUID()
  @IsOptional()
  parent_comment_id?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentMediaDto)
  medias?: CreateCommentMediaDto[];
}
