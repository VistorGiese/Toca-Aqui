import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verifyUrl = `${env.FRONTEND_URL}/verificar-email?token=${token}`;

  await transporter.sendMail({
    from: `"Toca Aqui" <${env.SMTP_FROM}>`,
    to: email,
    subject: 'Confirme seu email — Toca Aqui',
    html: `
      <h2>Bem-vindo ao Toca Aqui!</h2>
      <p>Clique no botão abaixo para confirmar seu email. O link expira em <strong>24 horas</strong>.</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#6d28d9;color:#fff;border-radius:6px;text-decoration:none;">
        Confirmar email
      </a>
      <p>Se você não criou uma conta, ignore este email.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from: `"Toca Aqui" <${env.SMTP_FROM}>`,
    to: email,
    subject: 'Redefinição de senha — Toca Aqui',
    html: `
      <h2>Redefinição de senha</h2>
      <p>Você solicitou a redefinição da sua senha.</p>
      <p>Clique no link abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6d28d9;color:#fff;border-radius:6px;text-decoration:none;">
        Redefinir senha
      </a>
      <p>Se você não fez essa solicitação, ignore este email.</p>
    `,
  });
};
