import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import facebookOauthConfig from '../config/facebook-oauth.config';
import type { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    @Inject(facebookOauthConfig.KEY)
    private facebookConfiguration: ConfigType<typeof facebookOauthConfig>,

    private readonly authService: AuthService,
  ) {
    super({
      clientID: facebookConfiguration.clientID!,
      clientSecret: facebookConfiguration.clientSecret!,
      callbackURL: facebookConfiguration.callbackURL!,
      scope: ['email', 'public_profile'],
      profileFields: ['emails', 'name', 'photos', 'verified'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const user = await this.authService.facebookLogin(profile);

    return user;
  }
}
