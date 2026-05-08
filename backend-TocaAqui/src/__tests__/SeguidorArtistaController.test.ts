process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../services/SeguidorArtistaService', () => ({
  seguidorArtistaService: {
    seguirOuDesseguir: jest.fn(),
    getPerfilArtistaPublico: jest.fn(),
    getArtistasQueSigo: jest.fn(),
  },
}));

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authmiddleware';
import { seguirOuDesseguir, getPerfilPublico, getArtistasQueSigo } from '../controllers/SeguidorArtistaController';
import { seguidorArtistaService } from '../services/SeguidorArtistaService';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<AuthRequest> = {}): AuthRequest =>
  ({ params: {}, query: {}, body: {}, ...overrides } as AuthRequest);

describe('SeguidorArtistaController', () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  // ─── seguirOuDesseguir ────────────────────────────────────────────────────
  describe('seguirOuDesseguir', () => {
    it('retorna mensagem de seguir quando passou a seguir', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '7' } });
      const res = mockRes();

      (seguidorArtistaService.seguirOuDesseguir as jest.Mock).mockResolvedValue({ seguindo: true, total_seguidores: 100 });

      seguirOuDesseguir(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(seguidorArtistaService.seguirOuDesseguir).toHaveBeenCalledWith(1, 7);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Artista seguido com sucesso', seguindo: true })
      );
    });

    it('retorna mensagem de desseguir quando deixou de seguir', async () => {
      const req = makeReq({ user: { id: 1 }, params: { id: '7' } });
      const res = mockRes();

      (seguidorArtistaService.seguirOuDesseguir as jest.Mock).mockResolvedValue({ seguindo: false, total_seguidores: 99 });

      seguirOuDesseguir(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Artista desseguido com sucesso', seguindo: false })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined, params: { id: '7' } });
      const res = mockRes();

      seguirOuDesseguir(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  // ─── getPerfilPublico ─────────────────────────────────────────────────────
  describe('getPerfilPublico', () => {
    it('retorna perfil público do artista sem usuário autenticado', async () => {
      const perfil = { id: 7, nome_artistico: 'DJ Teste', total_seguidores: 50 };
      const req = makeReq({ params: { id: '7' } });
      const res = mockRes();

      (seguidorArtistaService.getPerfilArtistaPublico as jest.Mock).mockResolvedValue(perfil);

      getPerfilPublico(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(seguidorArtistaService.getPerfilArtistaPublico).toHaveBeenCalledWith(7, undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Perfil do artista encontrado com sucesso', perfil })
      );
    });

    it('passa usuario_id ao service quando autenticado', async () => {
      const perfil = { id: 7, nome_artistico: 'DJ Teste', eu_sigo: true };
      const req = makeReq({ params: { id: '7' }, user: { id: 42 } });
      const res = mockRes();

      (seguidorArtistaService.getPerfilArtistaPublico as jest.Mock).mockResolvedValue(perfil);

      getPerfilPublico(req as unknown as Request, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(seguidorArtistaService.getPerfilArtistaPublico).toHaveBeenCalledWith(7, 42);
    });
  });

  // ─── getArtistasQueSigo ───────────────────────────────────────────────────
  describe('getArtistasQueSigo', () => {
    it('retorna artistas que o usuário segue', async () => {
      const artistas = [{ id: 1, nome_artistico: 'Banda X' }, { id: 2, nome_artistico: 'DJ Y' }];
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (seguidorArtistaService.getArtistasQueSigo as jest.Mock).mockResolvedValue(artistas);

      getArtistasQueSigo(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(seguidorArtistaService.getArtistasQueSigo).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Artistas que você segue listados com sucesso', total: 2, artistas })
      );
    });

    it('retorna lista vazia quando não segue ninguém', async () => {
      const req = makeReq({ user: { id: 1 } });
      const res = mockRes();

      (seguidorArtistaService.getArtistasQueSigo as jest.Mock).mockResolvedValue([]);

      getArtistasQueSigo(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: 0, artistas: [] })
      );
    });

    it('lança 401 quando usuário não identificado', async () => {
      const req = makeReq({ user: undefined });
      const res = mockRes();

      getArtistasQueSigo(req, res, mockNext as unknown as NextFunction);
      await flushPromises();

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });
});
