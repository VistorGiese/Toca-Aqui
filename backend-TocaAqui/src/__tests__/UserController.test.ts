process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/AuthService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    getUserProfile: jest.fn(),
    createEstablishmentProfile: jest.fn(),
    createArtistProfile: jest.fn(),
  },
}));

jest.mock('../services/UploadService', () => ({
  uploadService: {
    getRelativePath: jest.fn().mockReturnValue('uploads/test.jpg'),
    deleteFile: jest.fn(),
  },
}));

jest.mock('../utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findOne: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../models/PreferenciaUsuarioModel', () => ({
  __esModule: true,
  default: {
    upsert: jest.fn(),
    findOne: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getUserProfile,
  createEstablishmentProfile,
  createArtistProfile,
  uploadArtistPhoto,
  atualizarPerfilArtista,
  alterarEmail,
  alterarNome,
  savePreferencias,
  atualizarIndisponibilidades,
  excluirConta,
  getMinhasPaginas,
  getPreferencias,
} from '../controllers/UserController';
import { authService } from '../services/AuthService';
import { uploadService } from '../services/UploadService';
import { verifyToken } from '../utils/jwt';
import ArtistProfileModel from '../models/ArtistProfileModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import UserModel from '../models/UserModel';
import bcrypt from 'bcryptjs';
import PreferenciaUsuarioModel from '../models/PreferenciaUsuarioModel';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('UserController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── registerUser ─────────────────────────────────────────────────────────
  describe('registerUser', () => {
    it('registra usuário e retorna 201', async () => {
      const user = { id: 1, nome_completo: 'Teste', email: 'teste@email.com' };
      const req = makeReq({ body: { nome_completo: 'Teste', email: 'teste@email.com', senha: 'Senha123' } });
      const res = mockRes();

      (authService.register as jest.Mock).mockResolvedValue(user);

      registerUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ user })
      );
    });
  });

  // ─── loginUser ────────────────────────────────────────────────────────────
  describe('loginUser', () => {
    it('retorna token e dados do usuário', async () => {
      const loginResult = { token: 'jwt-token', user: { id: 1, nome_completo: 'Teste' } };
      const req = makeReq({ body: { email: 'teste@email.com', senha: 'Senha123' } });
      const res = mockRes();

      (authService.login as jest.Mock).mockResolvedValue(loginResult);

      loginUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'jwt-token', message: 'Login realizado com sucesso' })
      );
    });

    it('passa AppError 400 quando email ou senha faltam', async () => {
      const req = makeReq({ body: { email: 'teste@email.com' } });
      const res = mockRes();

      loginUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 400 quando ambos faltam', async () => {
      const req = makeReq({ body: {} });
      const res = mockRes();

      loginUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── logoutUser ───────────────────────────────────────────────────────────
  describe('logoutUser', () => {
    it('realiza logout com sucesso', async () => {
      const req = makeReq({ user: { id: 1 }, token: 'meu-token' } as any);
      const res = mockRes();

      (verifyToken as jest.Mock).mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      logoutUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(authService.logout).toHaveBeenCalledWith('meu-token', expect.any(Number));
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout realizado com sucesso' });
    });

    it('passa AppError 400 quando token não encontrado', async () => {
      const req = makeReq({ user: { id: 1 }, token: undefined } as any);
      const res = mockRes();

      logoutUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 400 quando token sem exp', async () => {
      const req = makeReq({ user: { id: 1 }, token: 'token' } as any);
      const res = mockRes();

      (verifyToken as jest.Mock).mockReturnValue(null);

      logoutUser(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── forgotPassword ───────────────────────────────────────────────────────
  describe('forgotPassword', () => {
    it('envia resposta genérica sem revelar existência do email', async () => {
      const req = makeReq({ body: { email: 'teste@email.com' } });
      const res = mockRes();

      (authService.forgotPassword as jest.Mock).mockResolvedValue(undefined);

      forgotPassword(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });
  });

  // ─── resetPassword ────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('redefine senha com sucesso', async () => {
      const req = makeReq({ body: { token: 'reset-token', nova_senha: 'NovaSenha123' } });
      const res = mockRes();

      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      resetPassword(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'NovaSenha123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Senha redefinida com sucesso.' })
      );
    });
  });

  // ─── verifyEmail ──────────────────────────────────────────────────────────
  describe('verifyEmail', () => {
    it('verifica email com sucesso', async () => {
      const req = makeReq({ query: { token: 'verify-token' } });
      const res = mockRes();

      (authService.verifyEmail as jest.Mock).mockResolvedValue({ alreadyVerified: false });

      verifyEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Email verificado com sucesso. Você já pode fazer login.' })
      );
    });

    it('retorna mensagem quando email já verificado', async () => {
      const req = makeReq({ query: { token: 'verify-token' } });
      const res = mockRes();

      (authService.verifyEmail as jest.Mock).mockResolvedValue({ alreadyVerified: true });

      verifyEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({ message: 'Email já verificado.' });
    });

    it('passa AppError 400 quando token ausente', async () => {
      const req = makeReq({ query: {} });
      const res = mockRes();

      verifyEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── getUserProfile ───────────────────────────────────────────────────────
  describe('getUserProfile', () => {
    it('retorna perfil formatado do usuário', async () => {
      const user = {
        id: 1,
        nome_completo: 'Teste',
        email: 'teste@email.com',
        EstablishmentProfiles: [],
        ArtistProfiles: [{ id: 1 }],
      };
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (authService.getUserProfile as jest.Mock).mockResolvedValue(user);

      getUserProfile(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 1,
          establishment_profiles: [],
          artist_profiles: [{ id: 1 }],
        }),
      });
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getUserProfile(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── createEstablishmentProfile ───────────────────────────────────────────
  describe('createEstablishmentProfile', () => {
    it('cria perfil de estabelecimento e retorna 201', async () => {
      const profile = { id: 1, nome_estabelecimento: 'Bar' };
      const req = makeReq({ user: { id: 1 }, body: { nome_estabelecimento: 'Bar' } });
      const res = mockRes();

      (authService.createEstablishmentProfile as jest.Mock).mockResolvedValue(profile);

      createEstablishmentProfile(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ profile })
      );
    });

    it('passa AppError 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      createEstablishmentProfile(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ─── createArtistProfile ─────────────────────────────────────────────────
  describe('createArtistProfile', () => {
    it('cria perfil de artista e retorna 201', async () => {
      const profile = { id: 1, nome_artistico: 'DJ' };
      const req = makeReq({ user: { id: 1 }, body: { nome_artistico: 'DJ' } });
      const res = mockRes();

      (authService.createArtistProfile as jest.Mock).mockResolvedValue(profile);

      createArtistProfile(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ profile })
      );
    });
  });

  // ─── uploadArtistPhoto ────────────────────────────────────────────────────
  describe('uploadArtistPhoto', () => {
    it('faz upload da foto com sucesso', async () => {
      const profile = {
        id: 1,
        usuario_id: 1,
        foto_perfil: null,
        update: jest.fn().mockResolvedValue(undefined),
      };
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        file: { filename: 'test.jpg', size: 1024, mimetype: 'image/jpeg' } as any,
      } as any);
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      uploadArtistPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(profile.update).toHaveBeenCalledWith({ foto_perfil: 'uploads/test.jpg' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ foto_perfil: 'uploads/test.jpg' })
      );
    });

    it('passa AppError 400 quando nenhuma imagem enviada', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '1' } });
      const res = mockRes();

      uploadArtistPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 quando perfil não encontrado', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '999' },
        file: { filename: 'test.jpg' } as any,
      } as any);
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      uploadArtistPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
      expect(uploadService.deleteFile).toHaveBeenCalled();
    });

    it('passa AppError 403 quando usuário não é dono nem admin', async () => {
      const profile = { id: 1, usuario_id: 99, foto_perfil: null };
      const req = makeReq({
        user: { id: 1, role: 'artist' },
        params: { id: '1' },
        file: { filename: 'test.jpg' } as any,
      } as any);
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      uploadArtistPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
      expect(uploadService.deleteFile).toHaveBeenCalled();
    });
  });

  // ─── atualizarPerfilArtista (Phase 6) ─────────────────────────────────────
  describe('atualizarPerfilArtista', () => {
    const makeProfile = (overrides = {}) => ({
      id: 7,
      usuario_id: 1,
      nome_artistico: 'Artista Teste',
      biografia: 'Bio',
      generos: ['rock'],
      cache_minimo: 300,
      update: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('atualiza perfil e retorna sucesso quando usuário é dono', async () => {
      // Arrange
      const profile = makeProfile();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '7' },
        body: { nome_artistico: 'Novo Nome', biografia: 'Nova bio' },
      });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      // Act
      atualizarPerfilArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      // Assert
      expect(profile.update).toHaveBeenCalledWith(
        expect.objectContaining({ nome_artistico: 'Novo Nome', biografia: 'Nova bio' })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Perfil atualizado com sucesso' })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '7' } });
      const res = mockRes();

      atualizarPerfilArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('lança 404 quando perfil não encontrado', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '999' }, body: {} });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      atualizarPerfilArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança 403 quando perfil pertence a outro usuário', async () => {
      const req = makeReq({ user: { id: 99 }, params: { id: '7' }, body: {} });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(makeProfile({ usuario_id: 1 }));

      atualizarPerfilArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('atualiza apenas os campos fornecidos no body', async () => {
      // Arrange — somente nome_artistico no body; outros campos não devem aparecer em update
      const profile = makeProfile();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '7' },
        body: { nome_artistico: 'Só Nome' },
      });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      // Act
      atualizarPerfilArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      // Assert — update chamado com apenas o campo presente
      expect(profile.update).toHaveBeenCalledWith({ nome_artistico: 'Só Nome' });
    });

    it('atualiza múltiplos campos de uma vez', async () => {
      const profile = makeProfile();
      const req = makeReq({
        user: { id: 1 },
        params: { id: '7' },
        body: { nome_artistico: 'Novo Nome', biografia: 'Nova bio', cache_minimo: 500, cache_maximo: 2000, generos: ['jazz'] },
      });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      atualizarPerfilArtista(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(profile.update).toHaveBeenCalledWith({
        nome_artistico: 'Novo Nome',
        biografia: 'Nova bio',
        cache_minimo: 500,
        cache_maximo: 2000,
        generos: ['jazz'],
      });
    });
  });

  // ─── alterarEmail ─────────────────────────────────────────────────────────
  describe('alterarEmail', () => {
    const makeUser = (overrides = {}) => ({
      id: 1,
      email: 'atual@email.com',
      senha: 'hash-senha',
      update: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('altera email com sucesso', async () => {
      const user = makeUser();
      const req = makeReq({ user: { id: 1 }, body: { novo_email: 'novo@email.com', senha: 'Senha123' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      alterarEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(user.update).toHaveBeenCalledWith({ email: 'novo@email.com' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Email alterado com sucesso' });
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      alterarEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('lança 400 quando novo_email ou senha ausentes', async () => {
      const req = makeReq({ user: { id: 1 }, body: { novo_email: 'novo@email.com' } });
      const res = mockRes();

      alterarEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança 404 quando usuário não encontrado no banco', async () => {
      const req = makeReq({ user: { id: 1 }, body: { novo_email: 'novo@email.com', senha: 'Senha123' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      alterarEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('lança 401 quando senha incorreta', async () => {
      const user = makeUser();
      const req = makeReq({ user: { id: 1 }, body: { novo_email: 'novo@email.com', senha: 'ErradA' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      alterarEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('lança 400 quando email já está em uso', async () => {
      const user = makeUser();
      const req = makeReq({ user: { id: 1 }, body: { novo_email: 'ocupado@email.com', senha: 'Senha123' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (UserModel.findOne as jest.Mock).mockResolvedValue(makeUser({ id: 2 }));

      alterarEmail(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ─── alterarNome ──────────────────────────────────────────────────────────
  describe('alterarNome', () => {
    const makeUser = (overrides = {}) => ({
      id: 1,
      nome_completo: 'Nome Antigo',
      update: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('altera nome com sucesso', async () => {
      const user = makeUser();
      const req = makeReq({ user: { id: 1 }, body: { nome_completo: 'Nome Novo' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);

      alterarNome(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(user.update).toHaveBeenCalledWith({ nome_completo: 'Nome Novo' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome alterado com sucesso' });
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      alterarNome(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('lança 400 quando nome_completo ausente', async () => {
      const req = makeReq({ user: { id: 1 }, body: {} });
      const res = mockRes();

      alterarNome(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança 404 quando usuário não encontrado no banco', async () => {
      const req = makeReq({ user: { id: 1 }, body: { nome_completo: 'Nome Novo' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      alterarNome(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });

  // ─── savePreferencias ─────────────────────────────────────────────────────
  describe('savePreferencias', () => {
    it('cria preferências e retorna 201 quando é a primeira vez', async () => {
      const preferencias = { usuario_id: 1, generos_favoritos: 'rock', cidade: 'SP' };
      const req = makeReq({ user: { id: 1 }, body: { generos_favoritos: 'rock', cidade: 'SP' } });
      const res = mockRes();

      (PreferenciaUsuarioModel.upsert as jest.Mock).mockResolvedValue([preferencias, true]);

      savePreferencias(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Preferências criadas com sucesso' })
      );
    });

    it('atualiza preferências e retorna 200 quando já existem', async () => {
      const preferencias = { usuario_id: 1, generos_favoritos: 'samba' };
      const req = makeReq({ user: { id: 1 }, body: { generos_favoritos: 'samba', raio_busca_km: 30 } });
      const res = mockRes();

      (PreferenciaUsuarioModel.upsert as jest.Mock).mockResolvedValue([preferencias, false]);

      savePreferencias(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Preferências atualizadas com sucesso' })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: {} });
      const res = mockRes();

      savePreferencias(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ─── atualizarIndisponibilidades ──────────────────────────────────────────
  describe('atualizarIndisponibilidades', () => {
    const makeProfile = (overrides = {}) => ({
      id: 1,
      usuario_id: 1,
      update: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('atualiza indisponibilidades com sucesso', async () => {
      const profile = makeProfile();
      const datas = ['2026-06-01', '2026-06-15'];
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { datas_indisponiveis: datas },
      });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      atualizarIndisponibilidades(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(profile.update).toHaveBeenCalledWith({ datas_indisponiveis: JSON.stringify(datas) });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Indisponibilidades atualizadas', datas_indisponiveis: datas })
      );
    });

    it('lança 400 quando datas_indisponiveis não é array', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '1' },
        body: { datas_indisponiveis: '2026-06-01' },
      });
      const res = mockRes();

      atualizarIndisponibilidades(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança 404 quando perfil não encontrado', async () => {
      const req = makeReq({
        user: { id: 1 },
        params: { id: '999' },
        body: { datas_indisponiveis: [] },
      });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      atualizarIndisponibilidades(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('lança 403 quando perfil pertence a outro usuário', async () => {
      const profile = makeProfile({ usuario_id: 99 });
      const req = makeReq({
        user: { id: 1, role: 'artist' as any },
        params: { id: '1' },
        body: { datas_indisponiveis: [] },
      });
      const res = mockRes();

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(profile);

      atualizarIndisponibilidades(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });

  // ─── excluirConta ─────────────────────────────────────────────────────────
  describe('excluirConta', () => {
    const makeUser = (overrides = {}) => ({
      id: 1,
      senha: 'hash-senha',
      destroy: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('exclui conta com sucesso', async () => {
      const user = makeUser();
      const req = makeReq({ user: { id: 1 }, body: { senha: 'Senha123' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      excluirConta(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(user.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Conta excluída com sucesso' });
    });

    it('lança 401 quando senha incorreta', async () => {
      const user = makeUser();
      const req = makeReq({ user: { id: 1 }, body: { senha: 'ErradA' } });
      const res = mockRes();

      (UserModel.findByPk as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      excluirConta(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
      expect(user.destroy).not.toHaveBeenCalled();
    });

    it('lança 400 quando senha ausente', async () => {
      const req = makeReq({ user: { id: 1 }, body: {} });
      const res = mockRes();

      excluirConta(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, body: { senha: 'abc' } });
      const res = mockRes();

      excluirConta(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ─── getMinhasPaginas ─────────────────────────────────────────────────────
  describe('getMinhasPaginas', () => {
    it('retorna ambos os perfis quando existem', async () => {
      const artistProfile = { id: 2, nome_artistico: 'DJ', foto_perfil: 'foto.jpg' };
      const estabProfile = { id: 5, nome_estabelecimento: 'Bar', tipo_estabelecimento: 'bar' };
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(artistProfile);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(estabProfile);

      getMinhasPaginas(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 1,
          pagina_artista: expect.objectContaining({ id: 2, nome_artistico: 'DJ' }),
          pagina_estabelecimento: expect.objectContaining({ id: 5 }),
        })
      );
    });

    it('retorna null para perfis não existentes', async () => {
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(null);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);

      getMinhasPaginas(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ pagina_artista: null, pagina_estabelecimento: null })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getMinhasPaginas(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ─── getPreferencias ──────────────────────────────────────────────────────
  describe('getPreferencias', () => {
    it('retorna preferências do usuário', async () => {
      const prefs = { usuario_id: 1, generos_favoritos: 'rock', cidade: 'SP' };
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (PreferenciaUsuarioModel.findOne as jest.Mock).mockResolvedValue(prefs);

      getPreferencias(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ preferencias: prefs })
      );
    });

    it('retorna null quando usuário não tem preferências', async () => {
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (PreferenciaUsuarioModel.findOne as jest.Mock).mockResolvedValue(null);

      getPreferencias(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ preferencias: null })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getPreferencias(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });
});
