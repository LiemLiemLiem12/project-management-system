// dto/forgot-password.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
