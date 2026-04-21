import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class AddMemberDto {
  @IsNotEmpty({ message: 'User ID is required' })
  user_id!: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be Leader, Memeber, Moderate' })
  role!: Role;
}
