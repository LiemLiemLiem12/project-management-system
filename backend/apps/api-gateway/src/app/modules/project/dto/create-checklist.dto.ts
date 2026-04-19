import { IsNotEmpty } from 'class-validator';

export class CreateChecklistDto {
  @IsNotEmpty({ message: 'task_id is required' })
  task_id!: string;

  @IsNotEmpty({ message: 'title is required' })
  title!: string;
}
