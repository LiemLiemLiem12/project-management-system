import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
// import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path/win32';
import { MailController } from './mail.controller';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: process.env.MAIL_USER || 'your_email_here',
          pass: process.env.MAIL_PASSWORD || 'your_app_password_here',
        },
      },
      defaults: {
        from: '"Popket Support" <support@popket.com>',
      },
      template: {
        // Đường dẫn quan trọng ở đây:
        dir: join(__dirname, 'templates'),
        // adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
