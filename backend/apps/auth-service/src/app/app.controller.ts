import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('test_event')
  getData(@Payload() body: any) {
    console.log('Received message in Auth Service:', body);
  }
}
