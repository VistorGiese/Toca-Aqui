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
