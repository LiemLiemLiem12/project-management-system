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
          
          <div style="border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; font-size: 22px; margin: 0; font-weight: 800;">Popket</h1>
          </div>

          <div style="text-align: center; padding: 10px 0 20px 0;">
            <p style="color: #4b5563; font-size: 15px; margin-bottom: 25px;">
              You have been invited to join the project <b>${projectName}</b> with the role of <b>${role}</b>.
            </p>
            
            <a href="${acceptLink}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; padding: 14px 36px; border-radius: 4px; margin: 10px 0 35px 0;">
              Accept Invitation
            </a>

            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              If you are not expecting this invitation, you can safely ignore this email.
            </p>
          </div>

          <div style="border-top: 1px solid #f3f4f6; padding-top: 25px; margin-top: 20px;">
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 0 0 25px 0;">
              This is an automated message from the Popket system.
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
        subject: `[Popket] Invitation to join project: ${projectName}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error(
        `Error sending project invitation email to ${email}:`,
        error,
      );
    }
  }
}
