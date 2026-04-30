import { Inject, Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { find, retry } from 'rxjs';
import { MailService } from '../mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @Inject() private readonly JwtService: JwtService,

    private eventEmitter: EventEmitter2,
  ) {}

  async validateUser({ email, password }: AuthPayloadDto) {
    const findUser: User | null = await this.userRepository.findOne({
      where: { email },
    });

    if (findUser?.provider !== 'local') return null;

    const isMatch = await bcrypt.compare(password, findUser.passwordHash);

    if (!isMatch) return null;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(`otp_${findUser.id}`, otp, 120000);

    this.eventEmitter.emit('sendOtpEmail', { email: findUser.email, otp });

    return {
      id: findUser.id,
      email: findUser.email,
    };
  }

  async getUsersByIds(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const users = await this.userRepository.find({
      where: {
        id: In(userIds),
      },

      select: ['id', 'fullName', 'avatarUrl'],
    });

    return users;
  }

  async verifyOtp(userId: string, userOtp: string) {
    const findUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!findUser)
      throw new RpcException({ message: 'User not found', statusCode: 404 });

    const cachedOtp = await this.cacheManager.get<string>(`otp_${userId}`);

    if (cachedOtp !== userOtp)
      throw new RpcException({
        message: 'Invalid OTP or expired',
        statusCode: 400,
      });

    await this.cacheManager.del(`otp_${userId}`);

    const accessToken = await this.JwtService.sign(
      { userId: findUser.id, email: findUser.email },
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m' },
    );

    // 2. Tạo Refresh Token (dài hạn - chuỗi ngẫu nhiên hoặc JWT)
    const refreshToken = await this.JwtService.signAsync(
      { userId: findUser.id },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
        secret: process.env.JWT_REFRESH_SECRET || '',
      },
    );

    await this.cacheManager.set(
      `refreshToken_${findUser.id}`,
      refreshToken,
      604800000,
    );

    const { passwordHash, ...user } = findUser;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async initSignup(email: string) {
    const userExists = await this.userRepository.findOne({
      where: { email },
    });

    if (userExists) {
      throw new RpcException({
        message: 'Email already exists',
        statusCode: 400,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = uuidv4();

    try {
      await this.cacheManager.set(`signup_otp_${email}`, otp, 120000);
      await this.cacheManager.set(`signup_init_token_${email}`, token, 900000);

      this.eventEmitter.emit('sendOtpEmail', { email, otp, appName: 'Popket' });

      return {
        success: true,
        message: 'OTP sent to email',
        expiresIn: '2 minutes',
        token,
      };
    } catch (error) {
      throw new RpcException({
        message: 'Failed to initialize signup',
        statusCode: 500,
      });
    }
  }

  async verifyOtpSignup(email: string, otp: string, token: string) {
    const savedOtp = await this.cacheManager.get(`signup_otp_${email}`);
    const savedToken = await this.cacheManager.get(
      `signup_init_token_${email}`,
    );

    if (!savedToken || savedToken !== token) {
      throw new RpcException({
        message: 'Sesssion expired',
        statusCode: 400,
      });
    }

    if (!savedOtp || savedOtp !== otp) {
      throw new RpcException({
        message: 'OTP is invalid or has expired',
        statusCode: 400,
      });
    }

    await this.cacheManager.del(`signup_otp_${email}`);
    await this.cacheManager.del(`signup_init_token_${email}`);

    const verificationToken = this.JwtService.sign(
      {
        email,
        type: 'SIGNUP_VERIFICATION',
      },
      {
        expiresIn: '5m',
        secret: process.env.SIGN_UP_VERIFY_SECRET || '',
      },
    );

    return {
      success: true,
      verificationToken,
      message: 'Verification successful. Please create a password.',
    };
  }

  async completeSignup(
    verificationToken: string,
    password: string,
    username: string,
    fullName: string,
    birthday: Date,
  ) {
    try {
      const payload = this.JwtService.verify(verificationToken, {
        secret: process.env.SIGN_UP_VERIFY_SECRET || '',
      });

      if (payload.type !== 'SIGNUP_VERIFICATION') {
        throw new RpcException({
          message: 'Invalid token type',
          statusCode: 400,
        });
      }

      const email = payload.email;

      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser) {
        throw new RpcException({
          message: 'User already exists',
          statusCode: 400,
        });
      }

      const existingUsername = await this.userRepository.findOneBy({
        username,
      });
      if (existingUsername) {
        throw new RpcException({
          message: 'Username already exists',
          statusCode: 400,
        });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Lưu User mới vào Database
      const newUser = this.userRepository.create({
        username,
        email,
        passwordHash: hashedPassword,
        fullName,
        avatarUrl: '',
        provider: 'local',
        birthday,
        createdAt: new Date(),
      });

      await this.userRepository.save(newUser);

      return {
        success: true,
        message: 'Account created successfully. You can now sign in.',
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new RpcException({
          message: 'Verification session expired',
          statusCode: 400,
        });
      }
      throw new RpcException({
        message: error.message || 'Internal error',
        statusCode: error.statusCode || 500,
      });
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.JwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });

      const cachedToken = await this.cacheManager.get<string>(
        `refreshToken_${payload.userId}`,
      );

      if (cachedToken !== refreshToken) {
        throw new RpcException({
          message: 'Refresh token is invalid',
          statusCode: 401,
        });
      }

      const user = await this.userRepository.findOneBy({ id: payload.userId });
      if (!user) {
        throw new RpcException({ message: 'User not found', statusCode: 401 });
      }

      const newPayload = { email: user.email, userId: user.id };

      const newAccessToken = await this.JwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      const newRefreshToken = await this.JwtService.sign(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      await this.cacheManager.set(
        `refreshToken_${user.id}`,
        newRefreshToken,
        604800000,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new RpcException({
        message: 'Refresh token expired or invalid',
        statusCode: 401,
      });
    }
  }

  async getStatus(userId: string) {
    const existingUser = await this.userRepository.findOneBy({ id: userId });
    if (!existingUser) {
      throw new RpcException({
        message: 'User not found',
        statusCode: 404,
      });
    }

    const { passwordHash, ...user } = existingUser;

    return user;
  }

  async forgotPasswordInit(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new RpcException({
        message: 'Account with this email does not exist',
        statusCode: 404,
      });
    }

    if (user.provider !== 'local') {
      throw new RpcException({
        message: `This account uses ${user.provider} login. Password reset is not allowed.`,
        statusCode: 400,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = uuidv4(); // Tạo token định danh phiên

    try {
      // Lưu cả OTP và Token vào Redis (hết hạn 2 phút)
      await this.cacheManager.set(`reset_otp_${email}`, otp, 120000);
      await this.cacheManager.set(`reset_init_token_${email}`, token, 120000);

      this.eventEmitter.emit('sendOtpEmail', {
        email,
        otp,
        appName: 'Popket',
        context: 'reset_password',
      });

      return {
        success: true,
        message: 'Password reset OTP sent to email',
        token, // Trả token về cho Frontend để Frontend đính kèm vào URL (giống signup)
      };
    } catch (error) {
      throw new RpcException({
        message: 'Failed to initialize password reset',
        statusCode: 500,
      });
    }
  }

  async verifyForgotPasswordOtp(email: string, otp: string, token: string) {
    const savedToken = await this.cacheManager.get(`reset_init_token_${email}`);
    const savedOtp = await this.cacheManager.get(`reset_otp_${email}`);

    if (!savedToken || savedToken !== token) {
      throw new RpcException({
        message: 'Session expired or invalid verification token',
        statusCode: 400,
      });
    }

    // 3. Validate OTP
    if (!savedOtp || savedOtp !== otp) {
      throw new RpcException({
        message: 'OTP is invalid or has expired',
        statusCode: 400,
      });
    }

    await this.cacheManager.del(`reset_otp_${email}`);
    await this.cacheManager.del(`reset_init_token_${email}`);

    const resetToken = this.JwtService.sign(
      {
        email,
        type: 'RESET_PASSWORD',
      },
      {
        expiresIn: '5m',
        secret: process.env.RESET_PASSWORD_SECRET || 'popket_reset_secret',
      },
    );

    return {
      success: true,
      resetToken,
      message: 'OTP verified. Please submit your new password.',
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const payload = this.JwtService.verify(resetToken, {
        secret: process.env.RESET_PASSWORD_SECRET || 'popket_reset_secret',
      });

      if (payload.type !== 'RESET_PASSWORD') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findOneBy({
        email: payload.email,
      });
      if (!user) {
        throw new Error('User not found');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.passwordHash = hashedPassword;
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Password has been reset successfully. You can now login.',
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new RpcException({
          message: 'Reset password session expired. Please request a new OTP.',
          statusCode: 400,
        });
      }
      throw new RpcException({
        message: error.message || 'Invalid or expired reset token',
        statusCode: 400,
      });
    }
  }

  async resendOtp(email: string, type: number) {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (type === 0) {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new RpcException({ message: 'User not found', statusCode: 404 });
      }

      await this.cacheManager.set(`otp_${user.id}`, newOtp, 120000);
      this.eventEmitter.emit('sendOtpEmail', { email, otp: newOtp });
    } else if (type === 1) {
      await this.cacheManager.set(`signup_otp_${email}`, newOtp, 120000);
      this.eventEmitter.emit('sendOtpEmail', {
        email,
        otp: newOtp,
        appName: 'Popket',
      });
    } else if (type === 2) {
      await this.cacheManager.set(`reset_otp_${email}`, newOtp, 120000);
      this.eventEmitter.emit('sendOtpEmail', {
        email,
        otp: newOtp,
        appName: 'Popket',
        context: 'reset_password',
      });
    } else {
      throw new RpcException({ message: 'Invalid OTP type', statusCode: 400 });
    }

    return {
      success: true,
      message: 'A new OTP has been sent to your email.',
    };
  }

  async getAuth(user: User) {
    const accessToken = await this.JwtService.sign(
      { userId: user.id, email: user.email },
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m' },
    );

    // 2. Tạo Refresh Token (dài hạn - chuỗi ngẫu nhiên hoặc JWT)
    const refreshToken = await this.JwtService.signAsync(
      { userId: user.id },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d',
        secret: process.env.JWT_REFRESH_SECRET || '',
      },
    );

    await this.cacheManager.set(
      `refreshToken_${user.id}`,
      refreshToken,
      604800000,
    );

    const { passwordHash, ...newUser } = user;

    return {
      newUser,
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(profile: any) {
    let existingUser = await this.userRepository.findOneBy({
      email: profile?._json?.email,
    });

    if (!existingUser) {
      const user = {
        email: profile?._json?.email,
        passwordHash: '',
        username: profile?._json?.given_name,
        fullName: profile?._json?.name,
        provider: 'google',
        avatarUrl: profile?._json?.picture,
        birthday: new Date(),
      };

      existingUser = await this.userRepository.save(user);
    }

    return this.getAuth(existingUser);
  }

  async facebookLogin(profile: any) {
    let existingUser = await this.userRepository.findOneBy({
      email: profile?._json?.email,
    });

    if (!existingUser) {
      const user = {
        email: profile?._json?.email,
        passwordHash: '',
        username: profile?._json?.last_name + profile?._json?.first_name,
        fullName: profile?._json?.name,
        provider: 'facebook',
        avatarUrl: profile?.photos[0]?.value,
        birthday: new Date(),
      };

      existingUser = await this.userRepository.save(user);
    }

    return this.getAuth(existingUser);
  }

  async checkUserExists(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    return { exists: !!user };
  }
}
