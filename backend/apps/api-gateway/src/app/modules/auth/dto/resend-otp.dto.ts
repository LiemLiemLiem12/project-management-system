import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendOTPDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;
}
