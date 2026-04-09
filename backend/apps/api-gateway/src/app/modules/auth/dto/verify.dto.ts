import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class verifyOtpDto {
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;
  @IsNotEmpty({ message: 'OTP is required' })
  otp!: string;
}
