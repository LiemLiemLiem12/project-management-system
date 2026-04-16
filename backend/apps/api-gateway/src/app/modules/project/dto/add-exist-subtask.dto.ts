import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AddExistingSubtaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Subtask ID is required' })
  subtaskId!: string;
}
