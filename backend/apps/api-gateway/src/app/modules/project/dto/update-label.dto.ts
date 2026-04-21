import { IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdateLabelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsHexColor({ message: 'Color code must be a valid hex color' })
  color_code?: string;
}
