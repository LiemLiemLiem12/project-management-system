import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  Matches,
} from 'class-validator';

export class CompleteSignupDto {
  @IsNotEmpty()
  @IsString()
  verificationToken!: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak: Must include uppercase, lowercase, number, and special character',
  })
  password!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsDateString()
  birthday!: Date;
}
