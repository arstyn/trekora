import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private resend: Resend;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    // Using RESEND_API_KEY from environment variables
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
  }

  async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    try {
      // Use your verified custom domain or the testing domain provided by Resend
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      // Resend sending payload
      const payload: any = {
        from: `Trekora <${fromEmail}>`,
        to: [to],
        subject,
      };

      if (html) {
        payload.html = html;
      } else if (text) {
        payload.text = text;
      }

      const { data, error } = await this.resend.emails.send(payload);

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(`Email sent to ${to} via Resend. ID: ${data?.id}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${errorMsg}`);
      throw error;
    }
  }
}
