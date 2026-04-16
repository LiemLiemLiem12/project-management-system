import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

// DTO cho các tham số trên URL (:projectId, :taskId)
export class TaskParamsDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  taskId!: string;
}
