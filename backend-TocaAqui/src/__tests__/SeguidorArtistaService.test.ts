process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb: (t: object) => Promise<any>) => cb({})),
  },
}));

jest.mock('../models/SeguidorArtistaModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../models/AvaliacaoShowModel', () => ({
  __esModule: true,
  default: { findAll: jest.fn() },
}));

import { seguidorArtistaService } from '../services/SeguidorArtistaService';
import SeguidorArtistaModel from '../models/SeguidorArtistaModel';
import ArtistProfileModel from '../models/ArtistProfileModel';

const makeArtista = (overrides = {}) => ({
  id: 1,
  nome_artista: 'The Band',
  toJSON: jest.fn().mockReturnValue({ id: 1, nome_artista: 'The Band' }),
  ...overrides,
});

describe('SeguidorArtistaService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── seguirOuDesseguir ─────────────────────────────────────────────────────
  describe('seguirOuDesseguir', () => {
    it('lança 404 quando artista não encontrado', async () => {
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(seguidorArtistaService.seguirOuDesseguir(1, 999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('segue artista quando ainda não segue', async () => {
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(makeArtista());
      (SeguidorArtistaModel.findOne as jest.Mock).mockResolvedValue(null);
      (SeguidorArtistaModel.create as jest.Mock).mockResolvedValue({});
      (SeguidorArtistaModel.count as jest.Mock).mockResolvedValue(5);

      const result = await seguidorArtistaService.seguirOuDesseguir(10, 1);

      expect(SeguidorArtistaModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 10, perfil_artista_id: 1 }),
        expect.anything()
      );
      expect(result).toEqual({ seguindo: true, total_seguidores: 5 });
    });

    it('dessegue artista quando já segue', async () => {
      const seguidorExistente = { destroy: jest.fn().mockResolvedValue(undefined) };

      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(makeArtista());
      (SeguidorArtistaModel.findOne as jest.Mock).mockResolvedValue(seguidorExistente);
      (SeguidorArtistaModel.count as jest.Mock).mockResolvedValue(3);

      const result = await seguidorArtistaService.seguirOuDesseguir(10, 1);

      expect(seguidorExistente.destroy).toHaveBeenCalled();
      expect(result).toEqual({ seguindo: false, total_seguidores: 3 });
    });
  });

  // ─── getArtistasQueSigo ────────────────────────────────────────────────────
  describe('getArtistasQueSigo', () => {
    it('retorna lista de artistas seguidos', async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      (SeguidorArtistaModel.findAll as jest.Mock).mockResolvedValue(lista);

      const result = await seguidorArtistaService.getArtistasQueSigo(10);

      expect(result).toBe(lista);
      expect(SeguidorArtistaModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { usuario_id: 10 } })
      );
    });

    it('retorna array vazio quando usuário não segue ninguém', async () => {
      (SeguidorArtistaModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await seguidorArtistaService.getArtistasQueSigo(10);

      expect(result).toEqual([]);
    });
  });

  // ─── getPerfilArtistaPublico ───────────────────────────────────────────────
  describe('getPerfilArtistaPublico', () => {
    it('lança 404 quando artista não encontrado', async () => {
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(seguidorArtistaService.getPerfilArtistaPublico(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('retorna perfil público com total_seguidores e seguindo=false sem usuário', async () => {
      const artista = makeArtista();
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(artista);
      (SeguidorArtistaModel.count as jest.Mock).mockResolvedValue(10);
      (SeguidorArtistaModel.findOne as jest.Mock).mockResolvedValue(null);

      // Mock AvaliacaoShowModel.findAll
      const { default: AvaliacaoShowModel } = await import('../models/AvaliacaoShowModel');
      (AvaliacaoShowModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await seguidorArtistaService.getPerfilArtistaPublico(1);

      expect(result.total_seguidores).toBe(10);
      expect(result.seguindo).toBe(false);
    });

    it('retorna seguindo=true quando usuário segue o artista', async () => {
      const artista = makeArtista();
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(artista);
      (SeguidorArtistaModel.count as jest.Mock).mockResolvedValue(7);
      (SeguidorArtistaModel.findOne as jest.Mock).mockResolvedValue({ id: 1 }); // isSeguindo retorna true

      const { default: AvaliacaoShowModel } = await import('../models/AvaliacaoShowModel');
      (AvaliacaoShowModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await seguidorArtistaService.getPerfilArtistaPublico(1, 99);

      expect(result.seguindo).toBe(true);
    });
  });
});
