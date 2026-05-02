import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendProjectInvite(
    email: string,
    projectName: string,
    role: string,
    token: string,
  ) {
    const acceptLink = `http://localhost:3000/accept-invite?token=${token}`;

    const htmlContent = `
      <div style="background-color: #f4f5f7; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; font-size: 22px; margin: 0; font-weight: 800;">Popket</h1>
          </div>

          <!-- Body -->
          <div style="text-align: center; padding: 10px 0 20px 0;">
            <p style="color: #4b5563; font-size: 15px; margin-bottom: 25px;">
              Bạn vừa được mời tham gia dự án <b>${projectName}</b> với vai trò <b>${role}</b>.
            </p>
            
            <a href="${acceptLink}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; padding: 14px 36px; border-radius: 4px; margin: 10px 0 35px 0;">
              Xác nhận tham gia
            </a>

            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              Nếu bạn không biết về dự án này, bạn có thể bỏ qua email này một cách an toàn.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #f3f4f6; padding-top: 25px; margin-top: 20px;">
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 0 0 25px 0;">
              Đây là tin nhắn từ hệ thống Popket gửi cho bạn
            </p>
            <div style="text-align: left;">
              <span style="color: #1e3a8a; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Popket</span>
            </div>
          </div>
          
        </div>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `[Popket] Lời mời tham gia dự án: ${projectName}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error(`Lỗi gửi mail mời dự án tới ${email}:`, error);
    }
  }
}
