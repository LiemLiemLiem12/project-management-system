import { Controller, HttpException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthPayloadDto } from './dto/auth.dto';
import { profile } from 'console';

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
  async verifyOtpSignup(
    @Payload() payload: { email: string; otp: string; token: string },
  ) {
    return this.authService.verifyOtpSignup(
      payload.email,
      payload.otp,
      payload.token,
    );
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

  @MessagePattern('auth.forgot_password.init')
  async forgotPasswordInit(@Payload() payload: { email: string }) {
    return this.authService.forgotPasswordInit(payload.email);
  }

  @MessagePattern('auth.forgot_password.verify_otp')
  async verifyForgotPasswordOtp(
    @Payload() payload: { email: string; otp: string; token: string },
  ) {
    return this.authService.verifyForgotPasswordOtp(
      payload.email,
      payload.otp,
      payload.token,
    );
  }

  @MessagePattern('auth.forgot_password.reset')
  async resetPassword(
    @Payload() payload: { resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      payload.resetToken,
      payload.newPassword,
    );
  }

  @MessagePattern('auth.resend_otp')
  async resendOTP(@Payload() payload: { email: string; type: string }) {
    return this.authService.resendOtp(payload.email, Number(payload.type));
  }

  @MessagePattern('auth.google')
  async googleLogin(@Payload() payload: { profile: any }) {
    return this.authService.googleLogin(payload.profile);
  }

  @MessagePattern('auth.facebook')
  async facebookLogin(@Payload() payload: { profile: any }) {
    return this.authService.facebookLogin(payload.profile);
  }
}
