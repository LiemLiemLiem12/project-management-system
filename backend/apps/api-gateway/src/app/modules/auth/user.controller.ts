import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOneByUserId(@Param('id') userId: string) {
    return this.userService.findOneByUserId(userId);
  }

  @Post('/bulk')
  async findUsersByIds(@Body() body: { ids: string[] }) {
    const { ids } = body;

    if (!ids) throw new BadRequestException('Ids not found');

    return this.userService.findUsersByIds(ids);
  }
}
