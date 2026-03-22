process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

jest.mock('../config/env', () => ({
  env: {
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: 587,
    SMTP_USER: 'test',
    SMTP_PASS: 'test',
    SMTP_FROM: 'noreply@test.com',
    FRONTEND_URL: 'http://localhost:3000',
  },
}));

import { sendVerificationEmail, sendPasswordResetEmail } from '../services/EmailService';

describe('EmailService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('sendVerificationEmail', () => {
    it('envia email de verificação com link correto', async () => {
      await sendVerificationEmail('user@test.com', 'abc123');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Confirme seu email'),
          html: expect.stringContaining('http://localhost:3000/verificar-email?token=abc123'),
        })
      );
    });

    it('envia de endereço correto', async () => {
      await sendVerificationEmail('user@test.com', 'token');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('noreply@test.com'),
        })
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('envia email de reset com link correto', async () => {
      await sendPasswordResetEmail('user@test.com', 'reset-token');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Redefinição de senha'),
          html: expect.stringContaining('http://localhost:3000/redefinir-senha?token=reset-token'),
        })
      );
    });
  });
});
