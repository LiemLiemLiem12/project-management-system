import { IsNotEmpty } from 'class-validator';

export class CreateChecklistDto {
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsNotEmpty({ message: 'Position is required' })
  position!: number;
}
