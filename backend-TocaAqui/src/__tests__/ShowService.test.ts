process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: { findAndCountAll: jest.fn(), findOne: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/AddressModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {},
}));

import { Op } from 'sequelize';
import { showService } from '../services/ShowService';
import BookingModel from '../models/BookingModel';

const mockEmpty = () =>
  (BookingModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

describe('ShowService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── getShowById ──────────────────────────────────────────────────────────
  describe('getShowById', () => {
    const makeShow = (overrides = {}) => ({
      id: 1,
      esta_publico: true,
      capacidade_maxima: 100,
      ingressos_vendidos: 40,
      toJSON: jest.fn().mockReturnValue({ id: 1, titulo_evento: 'Show A' }),
      ...overrides,
    });

    it('retorna show com ingressos_disponiveis e esgotado calculados', async () => {
      const show = makeShow();
      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);

      const result = await showService.getShowById(1);

      expect(result.ingressos_disponiveis).toBe(60);
      expect(result.esgotado).toBe(false);
    });

    it('calcula esgotado=true quando ingressos_vendidos >= capacidade_maxima', async () => {
      const show = makeShow({ capacidade_maxima: 50, ingressos_vendidos: 50 });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);

      const result = await showService.getShowById(1);

      expect(result.esgotado).toBe(true);
      expect(result.ingressos_disponiveis).toBe(0);
    });

    it('retorna ingressos_disponiveis=null quando sem capacidade_maxima', async () => {
      const show = makeShow({ capacidade_maxima: null });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);

      const result = await showService.getShowById(1);

      expect(result.ingressos_disponiveis).toBeNull();
      expect(result.esgotado).toBe(false);
    });

    it('lança 404 quando show não encontrado ou não público', async () => {
      (BookingModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(showService.getShowById(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── getShowsDestaque ─────────────────────────────────────────────────────
  describe('getShowsDestaque', () => {
    it('retorna lista de shows em destaque', async () => {
      const shows = [{ id: 1 }, { id: 2 }];
      (BookingModel.findAll as jest.Mock).mockResolvedValue(shows);

      const result = await showService.getShowsDestaque();

      expect(result).toBe(shows);
      expect(BookingModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });

    it('retorna lista vazia quando não há shows', async () => {
      (BookingModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await showService.getShowsDestaque(5);

      expect(result).toEqual([]);
      expect(BookingModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 })
      );
    });
  });

  // ─── searchShows ──────────────────────────────────────────────────────────
  describe('searchShows', () => {
    const { default: ArtistProfileModel } = require('../models/ArtistProfileModel');
    const { default: EstablishmentProfileModel } = require('../models/EstablishmentProfileModel');

    it('busca por artistas quando tipo="artistas"', async () => {
      const artistas = [{ id: 1, nome_artistico: 'Banda X' }];
      (ArtistProfileModel.findAll as jest.Mock).mockResolvedValue(artistas);

      const result = await showService.searchShows('rock', 'artistas');

      expect(result.tipo).toBe('artistas');
      expect(result.resultados).toBe(artistas);
      expect(ArtistProfileModel.findAll).toHaveBeenCalled();
    });

    it('busca por locais quando tipo="locais"', async () => {
      const locais = [{ id: 1, nome_estabelecimento: 'Bar do Rock' }];
      (EstablishmentProfileModel.findAll as jest.Mock).mockResolvedValue(locais);

      const result = await showService.searchShows('bar', 'locais');

      expect(result.tipo).toBe('locais');
      expect(result.resultados).toBe(locais);
      expect(EstablishmentProfileModel.findAll).toHaveBeenCalled();
    });

    it('busca por shows quando tipo não informado (padrão)', async () => {
      const shows = [{ id: 1, titulo_evento: 'Festival Rock' }];
      (BookingModel.findAll as jest.Mock).mockResolvedValue(shows);

      const result = await showService.searchShows('festival');

      expect(result.tipo).toBe('shows');
      expect(result.resultados).toBe(shows);
      expect(BookingModel.findAll).toHaveBeenCalled();
    });

    it('retorna resultado vazio quando não há correspondência', async () => {
      (BookingModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await showService.searchShows('xyzinexistente');

      expect(result.resultados).toEqual([]);
    });
  });

  describe('getPublicShows', () => {
    // ─── Phase 4: esta_hoje filter ────────────────────────────────────────────

    it('filtra data_show com Op.between hoje 00:00–23:59:59 quando esta_hoje=true', async () => {
      // Arrange
      mockEmpty();

      // Act
      await showService.getPublicShows({ esta_hoje: true });

      // Assert — deve usar Op.between, não Op.gte
      const whereArg = (BookingModel.findAndCountAll as jest.Mock).mock.calls[0][0].where;
      const dataShowFilter = whereArg.data_show;

      expect(dataShowFilter[Op.between]).toBeDefined();
      const [inicio, fim] = dataShowFilter[Op.between];

      expect(inicio.getHours()).toBe(0);
      expect(inicio.getMinutes()).toBe(0);
      expect(inicio.getSeconds()).toBe(0);

      expect(fim.getHours()).toBe(23);
      expect(fim.getMinutes()).toBe(59);
      expect(fim.getSeconds()).toBe(59);
    });

    it('início e fim do filtro esta_hoje são o mesmo dia do calendário', async () => {
      // Arrange
      mockEmpty();

      // Act
      await showService.getPublicShows({ esta_hoje: true });

      // Assert — ambas as datas devem ser hoje
      const whereArg = (BookingModel.findAndCountAll as jest.Mock).mock.calls[0][0].where;
      const [inicio, fim] = whereArg.data_show[Op.between];
      const hoje = new Date();

      expect(inicio.getFullYear()).toBe(hoje.getFullYear());
      expect(inicio.getMonth()).toBe(hoje.getMonth());
      expect(inicio.getDate()).toBe(hoje.getDate());

      expect(fim.getFullYear()).toBe(hoje.getFullYear());
      expect(fim.getMonth()).toBe(hoje.getMonth());
      expect(fim.getDate()).toBe(hoje.getDate());
    });

    it('usa Op.gte sem Op.between quando nenhum filtro de data é passado', async () => {
      // Arrange
      mockEmpty();

      // Act
      await showService.getPublicShows({});

      // Assert — filtro padrão: apenas datas futuras
      const whereArg = (BookingModel.findAndCountAll as jest.Mock).mock.calls[0][0].where;
      const dataShowFilter = whereArg.data_show;

      expect(dataShowFilter[Op.gte]).toBeDefined();
      expect(dataShowFilter[Op.between]).toBeUndefined();
    });

    it('usa Op.between com intervalo de 7 dias quando esta_semana=true', async () => {
      // Arrange
      mockEmpty();

      // Act
      await showService.getPublicShows({ esta_semana: true });

      // Assert — filtro de semana: entre hoje e hoje+7
      const whereArg = (BookingModel.findAndCountAll as jest.Mock).mock.calls[0][0].where;
      const [inicio, fim] = whereArg.data_show[Op.between];
      const diffMs = fim.getTime() - inicio.getTime();
      const diffDias = diffMs / (1000 * 60 * 60 * 24);

      expect(diffDias).toBeCloseTo(7, 0);
    });

    it('retorna estrutura com shows, total, page e totalPages', async () => {
      // Arrange
      const rows = [{ id: 1, titulo_evento: 'Show A' }, { id: 2, titulo_evento: 'Show B' }];
      (BookingModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 2, rows });

      // Act
      const result = await showService.getPublicShows({ page: 1, limit: 10 });

      // Assert
      expect(result).toEqual({ shows: rows, total: 2, page: 1, totalPages: 1 });
    });
  });
});
