import { Injectable } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm/repository/Repository.js';
import { In } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneByUserId(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new RpcException({
        message: 'User not found',
        statusCode: 404,
      });
    }

    return user;
  }

  async findUserByIds(ids: string[]) {
    return await this.userRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
}
