import { IsEmail, IsNotEmpty } from 'class-validator';

export class InitSignupDto {
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email!: string;
}
