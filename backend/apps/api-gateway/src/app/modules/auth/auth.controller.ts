import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { LocalGuard } from './guard/local.guard';
import { JwtAuthGuard } from './guard/jwt.guard';
import type { Request, Request } from 'express';
import type { Response } from 'express';
import { verifyOtpDto } from './dto/verify.dto';
import { InitSignupDto } from './dto/init-signup.dto';
import { VerifyOtpSignupDto } from './dto/verify-signup.dto';
import { CompleteSignupDto } from './dto/complete-signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from './dto/login.dto';
// localhost:3000/api/auth/login
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Request() req: any, @Body() body: LoginDto) {
    return req.user;
  }

  @Post('verify')
  async verifyOtp(
    @Body() verifyOtpDto: verifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { userId, otp } = verifyOtpDto;
    const { user, accessToken, refreshToken } =
      await this.authService.verifyOtp(userId, otp);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return {
      success: true,
      user: user,
      accessToken: accessToken,
    };
  }

  @Post('signup/init')
  async signUp(@Body() initSignupDto: InitSignupDto) {
    const { email } = initSignupDto;

    const result = await this.authService.initSignup(email);

    return result;
  }

  @Post('signup/verify-otp')
  async verifyOtpSignup(@Body() verifyOtpSignupDto: VerifyOtpSignupDto) {
    return await this.authService.verifyOtpSignup(
      verifyOtpSignupDto.email,
      verifyOtpSignupDto.otp,
    );
  }

  @Post('signup/complete')
  async completeSignup(@Body() completeSignupDto: CompleteSignupDto) {
    console.log(
      'Received complete signup request with data:',
      completeSignupDto,
    );
    return await this.authService.completeSignup(completeSignupDto);
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshTokenFromCookie = request.cookies['refreshToken'];

    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }

    const { accessToken, refreshToken } = await this.authService.refreshToken(
      refreshTokenFromCookie,
    );

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      accessToken,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    response.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return { success: true, message: 'Logged out' };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@Req() req: any) {
    return this.authService.getStatus(req.user.userId);
  }
}
