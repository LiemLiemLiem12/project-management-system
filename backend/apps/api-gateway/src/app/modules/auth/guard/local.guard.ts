import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { LoginDto } from '../dto/login.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    const object = plainToInstance(LoginDto, body);

    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.flatMap((error) =>
        Object.values(error.constraints || {}),
      );
      throw new BadRequestException(messages);
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
