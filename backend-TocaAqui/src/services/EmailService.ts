import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from: `"Toca Aqui" <${process.env.SMTP_FROM || 'noreply@tocaaqui.com'}>`,
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
