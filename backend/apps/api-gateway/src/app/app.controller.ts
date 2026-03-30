import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,

    @Inject(process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Get()
  getData() {
    this.authClient.emit('test_event', { message: 'Hello from API Gateway!' });
    return this.appService.getData();
  }
}
