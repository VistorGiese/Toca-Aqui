process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    exists: jest.fn().mockResolvedValue(false),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
    getClient: jest.fn().mockReturnValue({
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
    }),
  },
}));

jest.mock('../services/EmailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../models/AddressModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn().mockResolvedValue(null) },
}));

jest.mock('../services/GeocodingService', () => ({
  geocodificarEndereco: jest.fn().mockResolvedValue(null),
}));

import { AuthService } from '../services/AuthService';
import { AppError } from '../errors/AppError';
import UserModel from '../models/UserModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import redisService from '../config/redis';
import bcrypt from 'bcryptjs';

const service = new AuthService();

// Helper para criar um usuário fake com método update
const makeUser = (overrides = {}) => ({
  id: 1,
  nome_completo: 'Teste',
  email: 'teste@email.com',
  senha: '',
  role: 'artist',
  email_verificado: true,
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── register ─────────────────────────────────────────────────────────────
  describe('register', () => {
    it('cria o usuário e retorna dados sem senha quando email é novo', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(
        makeUser({ id: 5, email_verificado: true })
      );

      const result = await service.register({
        nome_completo: 'Ana',
        email: 'ana@email.com',
        senha: 'Senha1234',
      });

      expect(result).toEqual(
        expect.objectContaining({ id: 5, email: 'teste@email.com', email_verificado: false })
      );
      expect(result).not.toHaveProperty('senha');
    });

    it('lança AppError 400 quando email já existe', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(makeUser());

      await expect(
        service.register({ nome_completo: 'Ana', email: 'ana@email.com', senha: 'Senha1234' })
      ).rejects.toEqual(expect.objectContaining({ statusCode: 400, message: 'Email já está em uso' }));
    });

    it('lança AppError 400 para email com formato inválido', async () => {
      await expect(
        service.register({ nome_completo: 'Ana', email: 'email-invalido', senha: 'Senha1234' })
      ).rejects.toEqual(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança AppError 400 para senha com menos de 8 caracteres', async () => {
      await expect(
        service.register({ nome_completo: 'Ana', email: 'ana@email.com', senha: '123' })
      ).rejects.toEqual(expect.objectContaining({ statusCode: 400 }));
    });

    it('usa role common_user quando tipo_usuario não está na lista válida', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(
        makeUser({ role: 'common_user', email_verificado: true })
      );

      const result = await service.register({
        nome_completo: 'Ana',
        email: 'ana@email.com',
        senha: 'Senha1234',
        tipo_usuario: 'superadmin',
      });

      expect(UserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'common_user' })
      );
      expect(result.role).toBe('common_user');
    });

    it('usa role fornecida quando válida', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(
        makeUser({ role: 'artist', email_verificado: true })
      );

      await service.register({
        nome_completo: 'Músico',
        email: 'musico@email.com',
        senha: 'Senha1234',
        tipo_usuario: 'artist',
      });

      expect(UserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'artist' })
      );
    });

    it('armazena senha com hash no banco (não em texto plano)', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(makeUser({ email_verificado: true }));

      await service.register({ nome_completo: 'Ana', email: 'ana@email.com', senha: 'MinhaSenha1' });

      const chamada = (UserModel.create as jest.Mock).mock.calls[0][0];
      expect(chamada.senha).not.toBe('MinhaSenha1');
      expect(chamada.senha).toMatch(/^\$2[ab]\$/); // bcrypt hash
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('retorna token e dados do usuário para credenciais válidas', async () => {
      const hash = await bcrypt.hash('SenhaCorreta1', 10);
      (UserModel.findOne as jest.Mock).mockResolvedValue(
        makeUser({ id: 3, senha: hash, email_verificado: true })
      );

      const result = await service.login('teste@email.com', 'SenhaCorreta1');

      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(3);
    });

    it('lança AppError 401 quando email não está cadastrado', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login('nao@existe.com', 'qualquer')).rejects.toEqual(
        expect.objectContaining({ statusCode: 401, message: 'Credenciais inválidas' })
      );
    });

    it('lança AppError 401 quando senha está errada', async () => {
      const hash = await bcrypt.hash('SenhaCorreta1', 10);
      (UserModel.findOne as jest.Mock).mockResolvedValue(
        makeUser({ senha: hash, email_verificado: true })
      );

      await expect(service.login('teste@email.com', 'SenhaErrada')).rejects.toEqual(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('lança AppError 403 quando email não foi verificado', async () => {
      const hash = await bcrypt.hash('Senha1234', 10);
      (UserModel.findOne as jest.Mock).mockResolvedValue(
        makeUser({ senha: hash, email_verificado: false })
      );

      await expect(service.login('teste@email.com', 'Senha1234')).rejects.toEqual(
        expect.objectContaining({ statusCode: 403, message: 'Email não verificado. Verifique sua caixa de entrada.' })
      );
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('coloca o token na blacklist do Redis quando exp é futuro', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const clientMock = redisService.getClient();

      await service.logout('meu-token', futureExp);

      expect(clientMock.setex).toHaveBeenCalledWith(
        'blacklist:meu-token',
        expect.any(Number),
        '1'
      );
    });

    it('não chama setex quando exp já passou', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      const clientMock = redisService.getClient();

      await service.logout('token-expirado', pastExp);

      expect(clientMock.setex).not.toHaveBeenCalled();
    });
  });

  // ─── forgotPassword ───────────────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('gera token de reset e envia email quando usuário existe', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(makeUser());
      const { sendPasswordResetEmail } = require('../services/EmailService');

      await service.forgotPassword('teste@email.com');

      expect(redisService.getClient().setex).toHaveBeenCalledWith(
        expect.stringMatching(/^reset:/),
        3600,
        expect.any(String)
      );
      expect(sendPasswordResetEmail).toHaveBeenCalledWith('teste@email.com', expect.any(String));
    });

    it('retorna silenciosamente quando email não existe (sem revelar existência)', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const { sendPasswordResetEmail } = require('../services/EmailService');

      await expect(service.forgotPassword('nao@existe.com')).resolves.toBeUndefined();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  // ─── resetPassword ────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('atualiza a senha quando token é válido', async () => {
      const user = makeUser();
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce('1');
      (UserModel.findByPk as jest.Mock).mockResolvedValueOnce(user);

      await service.resetPassword('token-valido', 'NovaSenha123');

      expect(user.update).toHaveBeenCalledWith({ senha: expect.stringMatching(/^\$2[ab]\$/) });
      expect(redisService.getClient().del).toHaveBeenCalledWith('reset:token-valido');
    });

    it('lança AppError 400 quando token de reset não existe no Redis', async () => {
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.resetPassword('token-invalido', 'NovaSenha123')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança AppError 404 quando userId do token não encontra usuário', async () => {
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce('999');
      (UserModel.findByPk as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.resetPassword('token-orfao', 'NovaSenha123')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── verifyEmail ──────────────────────────────────────────────────────────
  describe('verifyEmail', () => {
    it('verifica o email com sucesso e retorna alreadyVerified false', async () => {
      const user = makeUser({ email_verificado: false });
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce('1');
      (UserModel.findByPk as jest.Mock).mockResolvedValueOnce(user);

      const result = await service.verifyEmail('token-verificacao');

      expect(result).toEqual({ alreadyVerified: false });
      expect(user.update).toHaveBeenCalledWith({ email_verificado: true });
      expect(redisService.getClient().del).toHaveBeenCalledWith('verify:token-verificacao');
    });

    it('retorna alreadyVerified true quando email já foi verificado', async () => {
      const user = makeUser({ email_verificado: true });
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce('1');
      (UserModel.findByPk as jest.Mock).mockResolvedValueOnce(user);

      const result = await service.verifyEmail('token-ja-usado');

      expect(result).toEqual({ alreadyVerified: true });
      expect(user.update).not.toHaveBeenCalled();
    });

    it('lança AppError 400 quando token de verificação não existe', async () => {
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.verifyEmail('token-expirado')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── resendVerificationEmail ──────────────────────────────────────────────
  describe('resendVerificationEmail', () => {
    it('retorna silenciosamente quando email não existe', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const { sendVerificationEmail } = require('../services/EmailService');

      await expect(service.resendVerificationEmail('nao@existe.com')).resolves.toBeUndefined();
      expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('retorna silenciosamente quando email já foi verificado', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(makeUser({ email_verificado: true }));
      const { sendVerificationEmail } = require('../services/EmailService');

      await expect(service.resendVerificationEmail('teste@email.com')).resolves.toBeUndefined();
      expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('envia novo email de verificação quando usuário existe e não verificou', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(makeUser({ email_verificado: false }));
      const { sendVerificationEmail } = require('../services/EmailService');

      await service.resendVerificationEmail('teste@email.com');

      expect(redisService.getClient().setex).toHaveBeenCalledWith(
        expect.stringMatching(/^verify:/),
        60 * 60 * 24,
        expect.any(String)
      );
      expect(sendVerificationEmail).toHaveBeenCalledWith('teste@email.com', expect.any(String));
    });
  });

  // ─── getUserProfile ────────────────────────────────────────────────────────
  describe('getUserProfile', () => {
    it('retorna perfil do usuário quando encontrado', async () => {
      const user = makeUser({ id: 5 });
      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);

      const result = await service.getUserProfile(5);

      expect(result).toBe(user);
    });

    it('lança 404 quando usuário não encontrado', async () => {
      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserProfile(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── verifyEmail — usuário não encontrado ──────────────────────────────────
  describe('verifyEmail — edge cases', () => {
    it('lança 404 quando token existe mas userId não encontra usuário', async () => {
      (redisService.getClient().get as jest.Mock).mockResolvedValueOnce('999');
      (UserModel.findByPk as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.verifyEmail('token-orfao')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── createEstablishmentProfile ───────────────────────────────────────────
  describe('createEstablishmentProfile', () => {
    const profileData = {
      nome_estabelecimento: 'Bar do Zé',
      generos_musicais: 'rock,mpb',
      horario_abertura: '18:00',
      horario_fechamento: '02:00',
      endereco_id: 10,
      telefone_contato: '11999999999',
    };

    it('cria o perfil quando endereço não está em uso', async () => {
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.create as jest.Mock).mockResolvedValueOnce({ id: 1, ...profileData, update: jest.fn().mockResolvedValue(undefined) });

      const result = await service.createEstablishmentProfile(1, profileData);

      expect(EstablishmentProfileModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 1, nome_estabelecimento: 'Bar do Zé' })
      );
      expect(result).toHaveProperty('id', 1);
    });

    it('lança AppError 400 quando endereço já está em uso', async () => {
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValueOnce({
        id: 5,
        nome_estabelecimento: 'Concorrente',
      });

      await expect(service.createEstablishmentProfile(1, profileData)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── createArtistProfile ─────────────────────────────────────────────────
  describe('createArtistProfile', () => {
    it('cria o perfil de artista com instrumentos e gêneros como JSON', async () => {
      (ArtistProfileModel.create as jest.Mock).mockResolvedValueOnce({ id: 2 });

      await service.createArtistProfile(1, {
        nome_artistico: 'DJ Teste',
        instrumentos: ['guitarra', 'baixo'],
        generos: ['rock'],
      });

      const chamada = (ArtistProfileModel.create as jest.Mock).mock.calls[0][0];
      expect(chamada.instrumentos).toEqual(['guitarra', 'baixo']);
      expect(chamada.generos).toEqual(['rock']);
      expect(chamada.usuario_id).toBe(1);
    });

    it('usa arrays vazios quando instrumentos/gêneros não são fornecidos', async () => {
      (ArtistProfileModel.create as jest.Mock).mockResolvedValueOnce({ id: 3 });

      await service.createArtistProfile(2, { nome_artistico: 'Cantor X' });

      const chamada = (ArtistProfileModel.create as jest.Mock).mock.calls[0][0];
      expect(chamada.instrumentos).toEqual([]);
      expect(chamada.generos).toEqual([]);
    });
  });
});
