import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private mailService: MailService) {}

  @OnEvent('sendOtpEmail')
  async handleSendOtpEmailEvent(payload: { email: string; otp: string }) {
    await this.mailService.sendOtpEmail(payload.email, payload.otp);
  }
}
