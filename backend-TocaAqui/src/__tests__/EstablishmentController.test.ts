process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../models/AddressModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../services/GeocodingService', () => ({
  geocodificarEndereco: jest.fn(),
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
  },
}));

jest.mock('../services/UploadService', () => ({
  uploadService: {
    getRelativePath: jest.fn((f: any) => `uploads/${f.filename}`),
    deleteFile: jest.fn(),
  },
}));

// Mock sequelize para evitar conexão com banco
jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return { ...actual, Op: actual.Op };
});

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import {
  listEstablishments,
  getEstablishment,
  updateEstablishment,
  deleteEstablishment,
  uploadEstablishmentPhotos,
  removeEstablishmentPhoto,
} from '../controllers/EstablishmentController';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';
import redisService from '../config/redis';
import { uploadService } from '../services/UploadService';
import { geocodificarEndereco } from '../services/GeocodingService';

// asyncHandler retorna void — drenar microtasks para aguardar a promise interna
const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

const makeEstablishment = (overrides = {}) => ({
  id: 1,
  usuario_id: 10,
  nome_estabelecimento: 'Bar do Zé',
  tipo_estabelecimento: 'bar',
  generos_musicais: 'rock',
  horario_abertura: '18:00',
  horario_fechamento: '02:00',
  endereco_id: 5,
  telefone_contato: '11999999999',
  esta_ativo: true,
  fotos: null,
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('EstablishmentController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── listEstablishments ───────────────────────────────────────────────────
  describe('listEstablishments', () => {
    it('retorna lista paginada sem cache', async () => {
      const rows = [makeEstablishment(), makeEstablishment({ id: 2, nome_estabelecimento: 'Bar 2' })];
      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 2, rows });

      const req = makeReq({ query: {} });
      const res = mockRes();

      listEstablishments(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: rows,
          pagination: expect.objectContaining({ total: 2, page: 1 }),
        })
      );
      expect(redisService.set).toHaveBeenCalled();
    });

    it('retorna dados do cache quando disponível', async () => {
      const cached = { success: true, data: [], pagination: { total: 0, page: 1 } };
      (redisService.get as jest.Mock).mockResolvedValueOnce(cached);

      const req = makeReq({ query: {} });
      const res = mockRes();

      listEstablishments(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(cached);
      expect(EstablishmentProfileModel.findAndCountAll).not.toHaveBeenCalled();
    });

    it('filtra por nome quando nome é fornecido', async () => {
      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 1, rows: [makeEstablishment()] });

      const req = makeReq({ query: { nome: 'Bar' } });
      const res = mockRes();

      listEstablishments(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(EstablishmentProfileModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ nome_estabelecimento: expect.anything() }),
        })
      );
    });

    it('filtra por tipo quando tipo é fornecido', async () => {
      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 1, rows: [makeEstablishment()] });

      const req = makeReq({ query: { tipo: 'bar' } });
      const res = mockRes();

      listEstablishments(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(EstablishmentProfileModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tipo_estabelecimento: 'bar' }),
        })
      );
    });

    it('clamps limit a 100 e mínimo a 1', async () => {
      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      const req = makeReq({ query: { limit: '9999' } });
      const res = mockRes();

      listEstablishments(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(EstablishmentProfileModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });
  });

  // ─── getEstablishment ─────────────────────────────────────────────────────
  describe('getEstablishment', () => {
    it('retorna estabelecimento existente', async () => {
      const establishment = makeEstablishment();
      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      getEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: establishment })
      );
    });

    it('passa AppError 404 ao next quando estabelecimento não existe', async () => {
      (redisService.get as jest.Mock).mockResolvedValueOnce(null);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const req = makeReq({ params: { id: '999' } });
      const res = mockRes();

      getEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('retorna dados do cache quando disponível', async () => {
      const cached = { success: true, data: makeEstablishment() };
      (redisService.get as jest.Mock).mockResolvedValueOnce(cached);

      const req = makeReq({ params: { id: '1' } });
      const res = mockRes();

      getEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(cached);
      expect(EstablishmentProfileModel.findByPk).not.toHaveBeenCalled();
    });
  });

  // ─── updateEstablishment ──────────────────────────────────────────────────
  describe('updateEstablishment', () => {
    it('atualiza quando usuário é o dono', async () => {
      const establishment = makeEstablishment({ usuario_id: 10 });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: { nome_estabelecimento: 'Bar Atualizado' },
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('atualiza quando usuário é admin (mesmo sem ser dono)', async () => {
      const establishment = makeEstablishment({ usuario_id: 999 });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({
        user: { id: 1, role: 'admin' as any },
        params: { id: '1' },
        body: { nome_estabelecimento: 'Admin Edit' },
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalled();
    });

    it('passa AppError 403 ao next quando usuário não é dono', async () => {
      const establishment = makeEstablishment({ usuario_id: 99 });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({
        user: { id: 1, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: {},
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('passa AppError 404 ao next quando estabelecimento não existe', async () => {
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const req = makeReq({
        user: { id: 1, role: 'establishment_owner' as any },
        params: { id: '999' },
        body: {},
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('atualiza todos os campos opcionais', async () => {
      const establishment = makeEstablishment({ usuario_id: 10 });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: {
          descricao: 'Nova descrição',
          generos_musicais: 'samba,forró',
          horario_abertura: '16:00',
          horario_fechamento: '00:00',
          telefone_contato: '44999999999',
          esta_ativo: false,
        },
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: 'Nova descrição',
          generos_musicais: 'samba,forró',
          horario_abertura: '16:00',
          horario_fechamento: '00:00',
          telefone_contato: '44999999999',
          esta_ativo: false,
        })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('geocodifica quando endereco_id muda e endereço é encontrado', async () => {
      const establishment = makeEstablishment({ usuario_id: 10, endereco_id: 5 });
      const novoEndereco = { rua: 'Rua Nova', numero: '200', cidade: 'Curitiba', estado: 'PR', cep: '80000-000' };

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);
      (AddressModel.findByPk as jest.Mock).mockResolvedValue(novoEndereco);
      (geocodificarEndereco as jest.Mock).mockResolvedValue({ latitude: -25.4, longitude: -49.2 });

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: { endereco_id: 10 },
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(geocodificarEndereco).toHaveBeenCalledWith('Rua Nova', '200', 'Curitiba', 'PR', '80000-000');
      expect(establishment.update).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: -25.4, longitude: -49.2 })
      );
    });

    it('não falha quando geocoding retorna null', async () => {
      const establishment = makeEstablishment({ usuario_id: 10, endereco_id: 5 });
      const novoEndereco = { rua: 'Rua X', numero: '1', cidade: 'Interior', estado: 'MG', cep: '00000-000' };

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(null);
      (AddressModel.findByPk as jest.Mock).mockResolvedValue(novoEndereco);
      (geocodificarEndereco as jest.Mock).mockResolvedValue(null);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: { endereco_id: 10 },
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalledWith(
        expect.objectContaining({ endereco_id: 10 })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('passa AppError 400 quando novo endereco_id já está em uso por outro estabelecimento', async () => {
      const establishment = makeEstablishment({ usuario_id: 10, endereco_id: 5 });
      const outroEstabelecimento = makeEstablishment({ id: 2, nome_estabelecimento: 'Outro Bar' });

      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);
      (EstablishmentProfileModel.findOne as jest.Mock).mockResolvedValue(outroEstabelecimento);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: { endereco_id: 99 }, // novo endereço diferente do atual (5)
      });
      const res = mockRes();

      updateEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── deleteEstablishment ──────────────────────────────────────────────────
  describe('deleteEstablishment', () => {
    it('desativa estabelecimento quando usuário é o dono', async () => {
      const establishment = makeEstablishment({ usuario_id: 10 });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
      });
      const res = mockRes();

      deleteEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalledWith({ esta_ativo: false });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it('passa AppError 403 ao next quando usuário não é dono', async () => {
      const establishment = makeEstablishment({ usuario_id: 99 });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({
        user: { id: 1, role: 'establishment_owner' as any },
        params: { id: '1' },
      });
      const res = mockRes();

      deleteEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('passa AppError 404 ao next quando estabelecimento não existe', async () => {
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const req = makeReq({
        user: { id: 1, role: 'admin' as any },
        params: { id: '999' },
      });
      const res = mockRes();

      deleteEstablishment(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── uploadEstablishmentPhotos ────────────────────────────────────────────
  describe('uploadEstablishmentPhotos', () => {
    it('adiciona fotos ao perfil do estabelecimento', async () => {
      const establishment = makeEstablishment({ usuario_id: 10, fotos: null });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const files = [
        { filename: 'foto1.jpg' },
        { filename: 'foto2.jpg' },
      ] as Express.Multer.File[];

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        files,
      } as any);
      const res = mockRes();

      uploadEstablishmentPhotos(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalledWith(
        expect.objectContaining({ fotos: expect.stringContaining('foto1.jpg') })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Fotos adicionadas com sucesso' })
      );
    });

    it('passa AppError 400 ao next quando nenhum arquivo é enviado', async () => {
      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        files: [],
      } as any);
      const res = mockRes();

      uploadEstablishmentPhotos(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('deleta arquivos enviados e passa 404 quando estabelecimento não existe', async () => {
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const files = [{ filename: 'foto.jpg' }] as Express.Multer.File[];
      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '999' },
        files,
      } as any);
      const res = mockRes();

      uploadEstablishmentPhotos(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(uploadService.deleteFile).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── removeEstablishmentPhoto ─────────────────────────────────────────────
  describe('removeEstablishmentPhoto', () => {
    it('remove foto existente do perfil', async () => {
      const establishment = makeEstablishment({
        usuario_id: 10,
        fotos: JSON.stringify(['uploads/foto-antiga.jpg']),
      });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: { filename: 'foto-antiga.jpg' },
      });
      const res = mockRes();

      removeEstablishmentPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(establishment.update).toHaveBeenCalledWith(
        expect.objectContaining({ fotos: '[]' })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Foto removida com sucesso' })
      );
    });

    it('passa AppError 400 ao next quando filename não é fornecido', async () => {
      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: {},
      });
      const res = mockRes();

      removeEstablishmentPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('passa AppError 404 ao next quando foto não existe no perfil', async () => {
      const establishment = makeEstablishment({
        usuario_id: 10,
        fotos: JSON.stringify(['uploads/outra-foto.jpg']),
      });
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(establishment);

      const req = makeReq({
        user: { id: 10, role: 'establishment_owner' as any },
        params: { id: '1' },
        body: { filename: 'nao-existe.jpg' },
      });
      const res = mockRes();

      removeEstablishmentPhoto(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });
});
