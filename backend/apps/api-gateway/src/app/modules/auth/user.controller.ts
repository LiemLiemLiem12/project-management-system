import { Controller, Get, Inject, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOneByUserId(@Param('id') userId: string) {
    return this.userService.findOneByUserId(userId);
  }
}
