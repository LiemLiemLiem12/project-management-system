import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchSubtaskQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'Keyword is required' })
  @MinLength(2, { message: 'Keyword must be at least 2 characters long' })
  keyword!: string;
}
