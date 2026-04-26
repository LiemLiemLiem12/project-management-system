import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '../auth/entities/user.entity';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.get-by-ids')
  async findUserByIds(payload: { ids: string[] }) {
    const result: User[] = await this.userService.findUserByIds(payload.ids);
    const resultFormat = result.map((user) => {
      const { passwordHash, ...userFormat } = user;
      return userFormat;
    });

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: resultFormat,
    };
  }

  @MessagePattern('user.get-by-id')
  async findOneByUserId(payload: { userId: string }) {
    const result = await this.userService.findOneByUserId(payload.userId);
    const { passwordHash, ...user } = result;
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }
}
