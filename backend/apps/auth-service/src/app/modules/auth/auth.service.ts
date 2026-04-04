import { Inject, Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { find } from 'rxjs';
import { MailService } from '../mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import * as bcrypt from 'bcrypt';

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

    if (!findUser || findUser.passwordHash !== password) return null;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cacheManager.set(`otp_${findUser.id}`, otp, 120000);

    this.eventEmitter.emit('sendOtpEmail', { email: findUser.email, otp });

    return {
      id: findUser.id,
    };
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
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d' },
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

    try {
      await this.cacheManager.set(`signup_otp_${email}`, otp, 120000);

      this.eventEmitter.emit('sendOtpEmail', { email, otp, appName: 'Popket' });

      return {
        success: true,
        message: 'OTP sent to email',
        expiresIn: '2 minutes',
      };
    } catch (error) {
      throw new RpcException({
        message: 'Failed to initialize signup',
        statusCode: 500,
      });
    }
  }

  async verifyOtpSignup(email: string, otp: string) {
    const savedOtp = await this.cacheManager.get(`signup_otp_${email}`);

    if (!savedOtp || savedOtp !== otp) {
      throw new RpcException({
        message: 'OTP is invalid or has expired',
        statusCode: 400,
      });
    }

    await this.cacheManager.del(`signup_otp_${email}`);

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
}
