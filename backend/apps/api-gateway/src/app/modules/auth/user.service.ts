import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable()
export class UserService {
  constructor(
    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  async findOneByUserId(userId: string) {
    try {
      return await firstValueFrom(
        this.authClient.send('user.get-by-id', { userId }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }

  async findUsersByIds(ids: string[]) {
    try {
      return await firstValueFrom(
        this.authClient.send('user.get-by-ids', { ids }),
      );
    } catch (error: any) {
      throw new HttpException(error.message, error.statusCode || 400);
    }
  }
}
