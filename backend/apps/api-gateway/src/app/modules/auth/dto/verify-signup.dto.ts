import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpSignupDto {
  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email!: string;

  @IsNotEmpty({ message: 'OTP cannot be empty' })
  otp!: string;
}
