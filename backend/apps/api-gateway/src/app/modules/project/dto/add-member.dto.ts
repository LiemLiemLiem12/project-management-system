import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../auth/enums/role.enum'; // Nhớ check file này xem value enum viết hoa hay thường nhé

export class AddMemberDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be LEADER, MEMBER, MODERATOR' })
  role!: Role;
}
