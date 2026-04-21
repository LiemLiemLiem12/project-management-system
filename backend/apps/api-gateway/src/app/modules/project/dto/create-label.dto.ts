import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateLabelDto {
  @IsNotEmpty({ message: 'Project ID is required' })
  project_id!: string;

  @IsNotEmpty({ message: 'Label name is required' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Color code is required' })
  @IsHexColor({
    message: 'Color code must be a valid hex color (e.g., #FF5733)',
  })
  color_code!: string;
}
