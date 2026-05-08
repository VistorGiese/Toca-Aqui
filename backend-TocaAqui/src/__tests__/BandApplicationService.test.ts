process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), update: jest.fn() },
}));

jest.mock('../models/BandApplicationModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findOne: jest.fn() },
}));

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

jest.mock('../services/ContractService', () => ({
  contractService: { generateFromApplication: jest.fn().mockResolvedValue(null) },
}));

jest.mock('../services/NotificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

import { BandApplicationService } from '../services/BandApplicationService';
import { AppError } from '../errors/AppError';
import BandModel from '../models/BandModel';
import BookingModel from '../models/BookingModel';
import BandApplicationModel from '../models/BandApplicationModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import ContractModel from '../models/ContractModel';

const service = new BandApplicationService();

// Helpers
const futureDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
};

const makeBanda = (overrides = {}) => ({ id: 1, nome_banda: 'Banda Teste', esta_ativo: true, ...overrides });
const makeEvento = (overrides = {}) => ({
  id: 10,
  titulo_evento: 'Show de Rock',
  status: 'pendente',
  data_show: futureDateStr(),
  perfil_estabelecimento_id: 5,
  ...overrides,
});
const makeAplicacao = (overrides = {}) => ({
  id: 100,
  banda_id: 1,
  evento_id: 10,
  status: 'pendente',
  data_aplicacao: new Date(),
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('BandApplicationService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── apply ────────────────────────────────────────────────────────────────
  describe('apply', () => {
    it('cria candidatura quando todos os critérios são atendidos', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock)
        .mockResolvedValueOnce(null)   // sem candidatura aceita
        .mockResolvedValueOnce(null);  // sem candidatura existente do mesmo band
      (BandApplicationModel.create as jest.Mock).mockResolvedValue(makeAplicacao());
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 99 });

      const result = await service.apply(1, 10);

      expect(BandApplicationModel.create).toHaveBeenCalledWith({ banda_id: 1, evento_id: 10 });
      expect(result).toHaveProperty('id', 100);
    });

    it('lança AppError 404 quando banda não existe', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.apply(999, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, message: 'Banda não encontrada' })
      );
    });

    it('lança AppError 400 quando banda não está ativa', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda({ esta_ativo: false }));

      await expect(service.apply(1, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança AppError 404 quando evento não existe', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.apply(1, 999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, message: 'Evento não encontrado' })
      );
    });

    // Nota: validação de data passada foi removida na Fase 2 (muito restritiva para TCC)

    it('lança AppError 400 quando evento está cancelado', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento({ status: 'cancelado' }));

      await expect(service.apply(1, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança AppError 400 quando evento já tem banda aceita', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock).mockResolvedValueOnce(makeAplicacao({ status: 'aceito' }));

      await expect(service.apply(1, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança AppError 400 quando banda já possui candidatura ativa para o evento', async () => {
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock)
        .mockResolvedValueOnce(null)                  // sem candidatura aceita
        .mockResolvedValueOnce(makeAplicacao());      // candidatura existente da banda

      await expect(service.apply(1, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── accept ───────────────────────────────────────────────────────────────
  describe('accept', () => {
    it('aceita candidatura, atualiza booking e rejeita demais candidatos', async () => {
      const aplicacao = makeAplicacao();
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock).mockResolvedValueOnce(null); // sem aprovada ainda
      (BandApplicationModel.update as jest.Mock).mockResolvedValue([1]);
      (BookingModel.update as jest.Mock).mockResolvedValue([1]);
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await service.accept(100);

      expect(aplicacao.update).toHaveBeenCalledWith({ status: 'aceito' });
      expect(BookingModel.update).toHaveBeenCalledWith(
        { status: 'aceito' },
        expect.objectContaining({ where: { id: 10 } })
      );
      // Phase 3: accept() deve retornar composite { aplicacao, contrato }
      expect(result).toEqual(expect.objectContaining({ aplicacao }));
      expect(result).toHaveProperty('contrato');
    });

    it('lança AppError 404 quando candidatura não existe', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.accept(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, message: 'Candidatura não encontrada' })
      );
    });

    it('lança AppError 404 quando banda da candidatura não existe', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(makeAplicacao());
      (BandModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.accept(100)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança AppError 400 quando banda não está ativa', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(makeAplicacao());
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda({ esta_ativo: false }));

      await expect(service.accept(100)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança AppError 400 quando evento está cancelado', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(makeAplicacao());
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento({ status: 'cancelado' }));

      await expect(service.accept(100)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança AppError 400 quando já existe banda aceita para o evento', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(makeAplicacao());
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock).mockResolvedValueOnce(makeAplicacao({ status: 'aceito', id: 99 }));

      await expect(service.accept(100)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400, message: 'Já existe banda aceita para este evento' })
      );
    });
  });

  // ─── apply — valor_proposto (Phase 02) ───────────────────────────────────
  describe('apply — valor_proposto', () => {
    it('persiste valor_proposto na candidatura de artista individual', async () => {
      // Arrange
      const artista = { id: 7, nome_artistico: 'Artista Solo', usuario_id: 42 };
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock)
        .mockResolvedValueOnce(null)  // sem candidatura aceita no evento
        .mockResolvedValueOnce(null); // sem candidatura ativa do artista
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(artista);
      (BandApplicationModel.create as jest.Mock).mockResolvedValue(makeAplicacao({ artista_id: 7, valor_proposto: 450 }));
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 99 });

      // Act
      await service.apply(undefined, 10, 42, undefined, undefined, 450);

      // Assert
      expect(BandApplicationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ valor_proposto: 450 })
      );
    });

    it('persiste valor_proposto na candidatura de banda', async () => {
      // Arrange
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandApplicationModel.findOne as jest.Mock)
        .mockResolvedValueOnce(null)  // sem candidatura aceita no evento
        .mockResolvedValueOnce(null); // sem candidatura ativa da banda
      (BandApplicationModel.create as jest.Mock).mockResolvedValue(makeAplicacao({ valor_proposto: 300 }));
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 99 });

      // Act
      await service.apply(1, 10, undefined, undefined, undefined, 300);

      // Assert
      expect(BandApplicationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ valor_proposto: 300 })
      );
    });
  });

  // ─── getApplicationsForEvent ──────────────────────────────────────────────
  describe('getApplicationsForEvent', () => {
    it('retorna lista de candidaturas quando evento está aberto', async () => {
      const candidaturas = [makeAplicacao(), makeAplicacao({ id: 101 })];
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento({ status: 'pendente' }));
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue(candidaturas);

      const result = await service.getApplicationsForEvent(10);

      expect(result.closed).toBe(false);
      expect(result.aplicacoes).toHaveLength(2);
    });

    it('retorna closed true quando evento está aceito e ainda retorna candidaturas existentes', async () => {
      // Nota: a implementação atual chama findAll mesmo quando closed=true
      // para retornar as candidaturas do evento fechado
      const candidaturas = [makeAplicacao()];
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento({ status: 'aceito' }));
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue(candidaturas);

      const result = await service.getApplicationsForEvent(10);

      expect(result.closed).toBe(true);
      expect(BandApplicationModel.findAll).toHaveBeenCalled();
    });

    it('lança AppError 404 quando evento não existe', async () => {
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getApplicationsForEvent(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── reject ───────────────────────────────────────────────────────────────
  describe('reject', () => {
    it('rejeita candidatura pendente com sucesso', async () => {
      const aplicacao = makeAplicacao({ banda_id: 1 });
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.reject(100);

      expect(aplicacao.update).toHaveBeenCalledWith({ status: 'rejeitado' });
      expect(result).toBe(aplicacao);
    });

    it('lança 404 quando candidatura não encontrada', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.reject(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, message: 'Candidatura não encontrada' })
      );
    });

    it('lança 400 quando candidatura não está pendente', async () => {
      const aplicacao = makeAplicacao({ status: 'aceito' });
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);

      await expect(service.reject(100)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('rejeita candidatura de artista individual e notifica', async () => {
      const aplicacao = makeAplicacao({ artista_id: 7, banda_id: undefined });
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 7, usuario_id: 42, nome_artistico: 'Solo' });

      const result = await service.reject(100);

      expect(aplicacao.update).toHaveBeenCalledWith({ status: 'rejeitado' });
      expect(result).toBe(aplicacao);
    });

    it('rejeita candidatura de banda e notifica líder', async () => {
      const aplicacao = makeAplicacao({ banda_id: 1 });
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(makeEvento());
      (BandModel.findByPk as jest.Mock).mockResolvedValue(makeBanda());
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue({ perfil_artista_id: 10 });
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue({ id: 10, usuario_id: 55, nome_artistico: 'Líder' });

      const result = await service.reject(100);

      expect(result).toBe(aplicacao);
    });
  });

  // ─── getApplicationsByArtist (Phase 02) ──────────────────────────────────
  describe('getApplicationsByArtist', () => {
    const makeArtistProfile = (overrides = {}) => ({ id: 7, usuario_id: 42, nome_artistico: 'Solo', ...overrides });
    const makeApp = (overrides = {}) => ({
      id: 200,
      status: 'pendente',
      mensagem: null,
      data_aplicacao: new Date(),
      evento_id: 10,
      artista_id: 7,
      valor_proposto: 350,
      Event: {
        titulo_evento: 'Festival',
        data_show: new Date(),
        horario_inicio: '20:00',
        horario_fim: '22:00',
        EstablishmentProfile: { nome_estabelecimento: 'Bar do Rock' },
      },
      ...overrides,
    });

    it('lança AppError 404 quando usuário não tem perfil de artista', async () => {
      // Arrange
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(null);

      // Act + Assert
      await expect(service.getApplicationsByArtist(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404, message: 'Perfil de artista não encontrado' })
      );
    });

    it('normaliza status "rejeitado" para "recusado" no retorno', async () => {
      // Arrange
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(makeArtistProfile());
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([makeApp({ status: 'rejeitado' })]);

      // Act
      const result = await service.getApplicationsByArtist(42);

      // Assert
      expect(result[0].status).toBe('recusado');
    });

    it('mantém status "pendente" inalterado', async () => {
      // Arrange
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(makeArtistProfile());
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([makeApp({ status: 'pendente' })]);

      // Act
      const result = await service.getApplicationsByArtist(42);

      // Assert
      expect(result[0].status).toBe('pendente');
    });

    it('inclui valor_proposto no retorno', async () => {
      // Arrange
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(makeArtistProfile());
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([makeApp({ valor_proposto: 450 })]);

      // Act
      const result = await service.getApplicationsByArtist(42);

      // Assert
      expect(result[0].valor_proposto).toBe(450);
    });

    it('busca contrato_id quando status é aceito e contrato existe', async () => {
      // Arrange
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(makeArtistProfile());
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([makeApp({ status: 'aceito' })]);
      (ContractModel.findOne as jest.Mock).mockResolvedValue({ id: 55 });

      // Act
      const result = await service.getApplicationsByArtist(42);

      // Assert
      expect(result[0].contrato_id).toBe(55);
    });

    it('retorna contrato_id null quando status é aceito mas contrato não existe', async () => {
      // Arrange
      (ArtistProfileModel.findOne as jest.Mock).mockResolvedValue(makeArtistProfile());
      (BandApplicationModel.findAll as jest.Mock).mockResolvedValue([makeApp({ status: 'aceito' })]);
      (ContractModel.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.getApplicationsByArtist(42);

      // Assert
      expect(result[0].contrato_id).toBeNull();
    });
  });
});
