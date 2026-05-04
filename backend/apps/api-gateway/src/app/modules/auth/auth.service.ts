import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { firstValueFrom } from 'rxjs';
import { CompleteSignupDto } from './dto/complete-signup.dto';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,

    @Inject(process.env.PROJECT_SERVICE_NAME || 'PROJECT_SERVICE')
    private readonly projectClient: ClientProxy,
  ) {}

  async login(email: string, password: string) {
    const result = await firstValueFrom(
      this.authClient.send('auth.login', {
        email,
        password,
      }),
    );
    return result;
  }

  async verifyOtp(userId: string, otp: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.verify', {
          userId,
          otp,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async initSignup(email: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.signup.init', {
          email,
        }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async verifyOtpSignup(email: string, otp: string, token: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.signup.verify_otp', { email, otp, token }),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async completeSignup(dto: CompleteSignupDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.signup.complete', dto),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.token.refresh', { refreshToken }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 401);
    }
  }

  async getStatus(userId: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.status', { userId }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 401);
    }
  }

  async forgotPasswordInit(email: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.forgot_password.init', { email }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 500);
    }
  }

  async verifyForgotPasswordOtp(email: string, otp: string, token: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.forgot_password.verify_otp', {
          email,
          otp,
          token,
        }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.forgot_password.reset', {
          resetToken,
          newPassword,
        }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async resendOTP(email: string, type: number) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.resend_otp', {
          email,
          type,
        }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async googleLogin(profile: any) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.google', {
          profile,
        }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async facebookLogin(profile: any) {
    try {
      return await firstValueFrom(
        this.authClient.send('auth.facebook', {
          profile,
        }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async checkRole(userId: string, projectId: string) {
    try {
      return await firstValueFrom(
        this.projectClient.send('project.checkRole', {
          userId,
          projectId,
        }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }
  async checkUserExists(email: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.check_email', email),
      );
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Lỗi khi kiểm tra email',
        error.statusCode || 500,
      );
    }
  }

  async updateProfile(
    userId: string,
    data: { full_name?: string; avatar_url?: string },
  ) {
    let finalAvatarUrl = data.avatar_url;

    if (finalAvatarUrl && finalAvatarUrl.includes('base64,')) {
      const base64Data = finalAvatarUrl.split(';base64,').pop() || '';
      const fileName = `avatar_${userId}_${Date.now()}.jpg`;

      const uploadPath = `./uploads/${fileName}`;

      fs.writeFileSync(uploadPath, base64Data, { encoding: 'base64' });

      finalAvatarUrl = `http://localhost:4000/uploads/${fileName}`;
    }

    const payload = {
      userId,
      full_name: data.full_name,
      avatar_url: finalAvatarUrl,
    };

    return firstValueFrom(this.authClient.send('user.update_profile', payload));
  }

  async initChangePassword(
    userId: string,
    data: { current_password: string; new_password: string },
  ) {
    return firstValueFrom(
      this.authClient.send('user.change_password.init', { userId, ...data }),
    );
  }

  async verifyChangePasswordOtp(
    userId: string,
    data: { otp: string; token: string },
  ) {
    return firstValueFrom(
      this.authClient.send('user.change_password.verify', { userId, ...data }),
    );
  }
}
