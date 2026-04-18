import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

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
