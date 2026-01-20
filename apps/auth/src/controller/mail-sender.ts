import nodemailer, { type Transporter } from "nodemailer";

class MailSender {
  private static instance: MailSender | null = null;
  private readonly mailer: Transporter;

  private constructor() {
    this.mailer = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  static getInstance(): MailSender {
    if (MailSender.instance === null) {
      MailSender.instance = new MailSender();
    }
    return MailSender.instance;
  }

  async sendEmail(props: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    try {
      await this.mailer.sendMail({
        from: process.env.SMTP_USER,
        to: props.to,
        subject: props.subject,
        text: props.text,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default MailSender;
