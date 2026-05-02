import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request: Request) => {
      //     let token = null;
      //     if (request && request.cookies) {
      //       token = request.cookies['accessToken'];
      //     }
      //     return token;
      //   },
      // ]),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  validate(payload: any) {
    return { userId: payload.userId, username: payload.email };
  }
}
