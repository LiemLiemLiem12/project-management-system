import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpEmail(to: string, otp: string, appName: string = 'Popket') {
    try {
      const htmlContent = this.buildOtpTemplate(otp, appName);

      await this.mailerService.sendMail({
        to: to,
        subject: `[${appName}] Mã xác thực OTP của bạn`,
        html: htmlContent,
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new InternalServerErrorException('Không thể gửi email xác thực.');
    }
  }

  private buildOtpTemplate(otp: string, appName: string): string {
    // Tách các biến màu để dễ quản lý
    const colors = {
      blue: '#0052CC', // Màu xanh đặc trưng của Atlassian/Jira
      textDark: '#172B4D',
      textLight: '#42526E',
      border: '#DFE1E6',
      bg: '#FFFFFF',
    };

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; padding: 50px 20px;">
        <div style="max-width: 600px; margin: auto; background-color: ${colors.bg}; padding: 40px; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; margin-bottom: 40px;">
             <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="${colors.blue}" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.33 2.14a1.2 1.2 0 0 0-1.83 0L2.23 10.63a1.2 1.2 0 0 0 0 1.63l7.27 8.49a1.2 1.2 0 0 0 1.83 0l7.27-8.49a1.2 1.2 0 0 0 0-1.63l-7.27-8.49Z"/>
                </svg>
                <span style="font-size: 24px; font-weight: bold; color: ${colors.textDark}; letter-spacing: -0.5px;">${appName}</span>
             </div>
          </div>

          <div style="border-top: 1px solid ${colors.border}; margin-bottom: 40px;"></div>

          <div style="text-align: center;">
            <p style="font-size: 14px; color: ${colors.textDark}; margin-bottom: 24px;">
              Mã xác minh của bạn là:
            </p>

            <h1 style="font-size: 36px; font-weight: 500; color: ${colors.textDark}; margin-bottom: 40px; letter-spacing: 2px;">
              ${otp}
            </h1>

            <p style="font-size: 14px; color: ${colors.textDark}; margin-bottom: 40px;">
              Nếu không đăng ký, bạn có thể bỏ qua email này một cách an toàn.
            </p>
          </div>

          <div style="border-top: 1px solid ${colors.border}; margin-bottom: 30px;"></div>

          <div style="text-align: center;">
            <p style="font-size: 12px; color: ${colors.textLight}; margin-bottom: 16px;">
              Đây là tin nhắn từ hệ thống ${appName} gửi cho bạn
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="${colors.blue}" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 22h20L12 2z"/>
               </svg>
               <span style="font-size: 12px; font-weight: bold; color: ${colors.blue}; text-transform: uppercase; letter-spacing: 1px;">
                 ${appName.toUpperCase()}
               </span>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}
