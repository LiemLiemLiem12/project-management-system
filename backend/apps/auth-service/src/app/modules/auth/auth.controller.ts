import { Controller, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthPayloadDto } from './dto/auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() authPayload: AuthPayloadDto) {
    return this.authService.validateUser(authPayload);
  }

  @MessagePattern('auth.verify')
  async verifyOtp(@Payload() payload: { userId: string; otp: string }) {
    const { userId, otp } = payload;
    return this.authService.verifyOtp(userId, otp);
  }

  @MessagePattern('auth.signup.init')
  async initSignup(@Payload() payload: { email: string }) {
    const { email } = payload;
    return this.authService.initSignup(email);
  }

  @MessagePattern('auth.signup.verify_otp')
  async verifyOtpSignup(@Payload() payload: { email: string; otp: string }) {
    return this.authService.verifyOtpSignup(payload.email, payload.otp);
  }

  @MessagePattern('auth.signup.complete')
  async completeSignup(
    @Payload()
    payload: {
      verificationToken: string;
      password: string;
      username: string;
      fullName: string;
      birthday: Date;
    },
  ) {
    return this.authService.completeSignup(
      payload.verificationToken,
      payload.password,
      payload.username,
      payload.fullName,
      payload.birthday,
    );
  }

  @MessagePattern('auth.token.refresh')
  async refreshToken(@Payload() data: { refreshToken: string }) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @MessagePattern('auth.status')
  async getStatus(@Payload() data: { userId: string }) {
    return this.authService.getStatus(data.userId);
  }
}
