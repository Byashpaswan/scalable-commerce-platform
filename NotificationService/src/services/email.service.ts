import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'dummy-email@gmail.com',
      pass: process.env.SMTP_PASS || 'dummy-app-password',
    },
  });

  public static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const from = process.env.EMAIL_FROM || '"Antigravity Shop" <no-reply@antigravityshop.com>';
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[EmailService] Email sent: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('[EmailService] Error sending email:', err);
      return false;
    }
  }
}
