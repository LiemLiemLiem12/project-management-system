import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { firstValueFrom } from 'rxjs';
import { CompleteSignupDto } from './dto/complete-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,
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

  async verifyOtpSignup(email: string, otp: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('auth.signup.verify_otp', { email, otp }),
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
}
