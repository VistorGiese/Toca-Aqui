process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/AvaliacaoShowModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/IngressoModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
  IngressoStatus: { CONFIRMADO: 'confirmado', PENDENTE: 'pendente', CANCELADO: 'cancelado' },
}));

jest.mock('../models/UserModel', () => ({
  __esModule: true,
  default: {},
}));

import { avaliacaoShowService } from '../services/AvaliacaoShowService';
import AvaliacaoShowModel from '../models/AvaliacaoShowModel';
import BookingModel from '../models/BookingModel';
import IngressoModel from '../models/IngressoModel';

const makeShow = (overrides = {}) => ({
  id: 1,
  data_show: new Date('2020-01-01'), // passado por padrão
  ...overrides,
});

const makeAvaliacao = (overrides = {}) => ({
  id: 1,
  nota_artista: 4,
  nota_local: 5,
  ...overrides,
});

describe('AvaliacaoShowService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── criarAvaliacao ────────────────────────────────────────────────────────
  describe('criarAvaliacao', () => {
    const payload = {
      usuario_id: 10,
      agendamento_id: 1,
      nota_artista: 4,
      nota_local: 5,
      comentario: 'Ótimo show',
    };

    it('cria avaliação com sucesso', async () => {
      const show = makeShow();
      const avaliacao = makeAvaliacao();

      (BookingModel.findByPk as jest.Mock).mockResolvedValue(show);
      (IngressoModel.findOne as jest.Mock).mockResolvedValue({ id: 99 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue(null);
      (AvaliacaoShowModel.create as jest.Mock).mockResolvedValue(avaliacao);

      const result = await avaliacaoShowService.criarAvaliacao(payload);

      expect(AvaliacaoShowModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario_id: 10, agendamento_id: 1 })
      );
      expect(result).toBe(avaliacao);
    });

    it('lança 404 quando show não encontrado', async () => {
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(avaliacaoShowService.criarAvaliacao(payload)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança 400 quando show ainda não aconteceu', async () => {
      const showFuturo = makeShow({ data_show: new Date(Date.now() + 86_400_000) });
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(showFuturo);

      await expect(avaliacaoShowService.criarAvaliacao(payload)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 400 quando usuário não tem ingresso confirmado', async () => {
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeShow());
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(avaliacaoShowService.criarAvaliacao(payload)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 400 quando usuário já avaliou este show', async () => {
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeShow());
      (IngressoModel.findOne as jest.Mock).mockResolvedValue({ id: 99 });
      (AvaliacaoShowModel.findOne as jest.Mock).mockResolvedValue({ id: 5 });

      await expect(avaliacaoShowService.criarAvaliacao(payload)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── getAvaliacoesByShow ───────────────────────────────────────────────────
  describe('getAvaliacoesByShow', () => {
    it('retorna zeros quando não há avaliações', async () => {
      (AvaliacaoShowModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await avaliacaoShowService.getAvaliacoesByShow(1);

      expect(result).toEqual({ media_artista: 0, media_local: 0, total: 0, avaliacoes: [] });
    });

    it('calcula médias corretamente com múltiplas avaliações', async () => {
      const avaliacoes = [
        makeAvaliacao({ nota_artista: 4, nota_local: 3 }),
        makeAvaliacao({ nota_artista: 2, nota_local: 5 }),
      ];
      (AvaliacaoShowModel.findAll as jest.Mock).mockResolvedValue(avaliacoes);

      const result = await avaliacaoShowService.getAvaliacoesByShow(1);

      expect(result.total).toBe(2);
      expect(result.media_artista).toBe(3.0);
      expect(result.media_local).toBe(4.0);
      expect(result.avaliacoes).toBe(avaliacoes);
    });

    it('arredonda médias com 1 decimal', async () => {
      const avaliacoes = [
        makeAvaliacao({ nota_artista: 5, nota_local: 4 }),
        makeAvaliacao({ nota_artista: 4, nota_local: 3 }),
        makeAvaliacao({ nota_artista: 3, nota_local: 5 }),
      ];
      (AvaliacaoShowModel.findAll as jest.Mock).mockResolvedValue(avaliacoes);

      const result = await avaliacaoShowService.getAvaliacoesByShow(1);

      expect(result.media_artista).toBe(4.0);
      expect(result.media_local).toBe(4.0);
    });
  });
});
