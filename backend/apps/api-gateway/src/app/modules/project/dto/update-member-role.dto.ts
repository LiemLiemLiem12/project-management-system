import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class UpdateMemberRoleDto {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be either Leader or Member' })
  role!: Role;
}
