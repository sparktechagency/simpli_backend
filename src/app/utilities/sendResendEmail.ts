import { Resend } from 'resend';
import config from '../config';

const resend = new Resend(config.resend.api_key as string);

interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ email, subject, html }: SendEmailOptions) => {
  try {
    await resend.emails.send({
      from: config.resend.from as string,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Resend email error:', error);
    throw new Error('Email sending failed');
  }
};

export default sendEmail;
