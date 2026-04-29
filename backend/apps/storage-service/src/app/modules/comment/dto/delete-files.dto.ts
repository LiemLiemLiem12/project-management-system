import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class DeleteFilesDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  publicIds!: string[];
}
