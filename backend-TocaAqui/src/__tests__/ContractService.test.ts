process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

jest.mock('../models/ContractModel', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
  ContractStatus: {
    RASCUNHO: 'rascunho',
    AGUARDANDO_ACEITE: 'aguardando_aceite',
    ACEITO: 'aceito',
    CANCELADO: 'cancelado',
    CONCLUIDO: 'concluido',
  },
  PaymentMethod: {
    PIX: 'pix',
    STRIPE: 'stripe',
  },
}));

jest.mock('../models/ContractHistoryModel', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../models/BandApplicationModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BandModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/BandMemberModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../models/ArtistProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), increment: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn(), findAll: jest.fn(), increment: jest.fn() },
}));

jest.mock('../models/AddressModel', () => ({
  __esModule: true,
  default: { findByPk: jest.fn() },
}));

jest.mock('../models/PaymentModel', () => ({
  __esModule: true,
  default: {},
}));

import { ContractService } from '../services/ContractService';
import ContractModel from '../models/ContractModel';
import ContractHistoryModel from '../models/ContractHistoryModel';
import BandApplicationModel from '../models/BandApplicationModel';
import BookingModel from '../models/BookingModel';
import BandModel from '../models/BandModel';
import BandMemberModel from '../models/BandMemberModel';
import ArtistProfileModel from '../models/ArtistProfileModel';
import EstablishmentProfileModel from '../models/EstablishmentProfileModel';
import AddressModel from '../models/AddressModel';

const service = new ContractService();

const makeContrato = (overrides = {}) => ({
  id: 1,
  aplicacao_id: 10,
  evento_id: 20,
  banda_id: 5,
  perfil_estabelecimento_id: 3,
  status: 'rascunho',
  cache_total: 5000,
  percentual_sinal: 50,
  valor_sinal: 2500,
  aceite_contratante: false,
  aceite_contratado: false,
  data_evento: new Date('2026-07-01'),
  penalidade_cancelamento_72h: 0,
  penalidade_cancelamento_24_72h: 50,
  penalidade_cancelamento_24h: 100,
  observacoes: '',
  versao: 1,
  update: jest.fn().mockResolvedValue(undefined),
  reload: jest.fn().mockImplementation(function (this: any) { return Promise.resolve(this); }),
  ...overrides,
});

describe('ContractService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── generateFromApplication ──────────────────────────────────────────────
  describe('generateFromApplication', () => {
    it('gera contrato a partir de candidatura aceita', async () => {
      const aplicacao = { id: 10, evento_id: 20, banda_id: 5 };
      const evento = { id: 20, perfil_estabelecimento_id: 3, data_show: '2026-07-01', horario_inicio: '20:00', horario_fim: '23:00' };
      const estabelecimento = { id: 3, nome_estabelecimento: 'Bar', telefone_contato: '11999', endereco_id: 1, generos_musicais: 'rock' };
      const endereco = { rua: 'Rua X', numero: '10', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000' };
      const banda = { id: 5, nome_banda: 'Rock Band' };
      const contrato = makeContrato();

      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (ContractModel.findOne as jest.Mock).mockResolvedValue(null);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(evento);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);
      (AddressModel.findByPk as jest.Mock).mockResolvedValue(endereco);
      (BandModel.findByPk as jest.Mock).mockResolvedValue(banda);
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);
      (BandMemberModel.findAll as jest.Mock).mockResolvedValue([]);
      (ContractModel.create as jest.Mock).mockResolvedValue(contrato);

      const result = await service.generateFromApplication(10);

      expect(ContractModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aplicacao_id: 10,
          banda_id: 5,
          status: 'aguardando_aceite',
        })
      );
      expect(result).toBe(contrato);
    });

    it('usa valor_proposto como cache_total e calcula valor_sinal a 50%', async () => {
      const aplicacao = { id: 10, evento_id: 20, banda_id: 5, valor_proposto: 600 };
      const evento = { id: 20, perfil_estabelecimento_id: 3, data_show: '2026-07-01', horario_inicio: '20:00', horario_fim: '23:00' };
      const estabelecimento = { id: 3, nome_estabelecimento: 'Bar', telefone_contato: '11999', endereco_id: 1, generos_musicais: 'rock' };
      const endereco = { rua: 'Rua X', numero: '10', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000' };
      const banda = { id: 5, nome_banda: 'Rock Band' };

      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (ContractModel.findOne as jest.Mock).mockResolvedValue(null);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(evento);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);
      (AddressModel.findByPk as jest.Mock).mockResolvedValue(endereco);
      (BandModel.findByPk as jest.Mock).mockResolvedValue(banda);
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);
      (ContractModel.create as jest.Mock).mockResolvedValue(makeContrato({ cache_total: 600, valor_sinal: 300 }));

      await service.generateFromApplication(10);

      expect(ContractModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ cache_total: 600, valor_sinal: 300 })
      );
    });

    it('usa 0 como cache_total quando valor_proposto é null', async () => {
      const aplicacao = { id: 10, evento_id: 20, banda_id: 5, valor_proposto: null };
      const evento = { id: 20, perfil_estabelecimento_id: 3, data_show: '2026-07-01', horario_inicio: '20:00', horario_fim: '23:00' };
      const estabelecimento = { id: 3, nome_estabelecimento: 'Bar', telefone_contato: '11999', endereco_id: 1, generos_musicais: 'rock' };
      const endereco = { rua: 'Rua X', numero: '10', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000' };
      const banda = { id: 5, nome_banda: 'Rock Band' };

      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(aplicacao);
      (ContractModel.findOne as jest.Mock).mockResolvedValue(null);
      (BookingModel.findByPk as jest.Mock).mockResolvedValue(evento);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue(estabelecimento);
      (AddressModel.findByPk as jest.Mock).mockResolvedValue(endereco);
      (BandModel.findByPk as jest.Mock).mockResolvedValue(banda);
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);
      (ContractModel.create as jest.Mock).mockResolvedValue(makeContrato({ cache_total: 0, valor_sinal: 0 }));

      await service.generateFromApplication(10);

      expect(ContractModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ cache_total: 0, valor_sinal: 0 })
      );
    });

    it('lança erro quando candidatura não encontrada', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.generateFromApplication(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança erro quando já existe contrato para a candidatura', async () => {
      (BandApplicationModel.findByPk as jest.Mock).mockResolvedValue({ id: 10 });
      (ContractModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(service.generateFromApplication(10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── getById ──────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('retorna contrato com includes', async () => {
      const contrato = makeContrato();
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      const result = await service.getById(1);
      expect(result).toBe(contrato);
    });

    it('lança 404 quando não encontrado', async () => {
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── acceptContract ───────────────────────────────────────────────────────
  describe('acceptContract', () => {
    it('aceita pelo contratante e muda para aguardando_aceite', async () => {
      const contrato = makeContrato({ cache_total: 5000 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      const result = await service.acceptContract(1, 1, 'contratante');

      expect(contrato.update).toHaveBeenCalledWith(
        expect.objectContaining({
          aceite_contratante: true,
          status: 'aguardando_aceite',
        })
      );
      expect(result).toBe(contrato);
    });

    it('muda para aceito quando ambos aceitaram', async () => {
      const contrato = makeContrato({ cache_total: 5000, aceite_contratado: true });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await service.acceptContract(1, 1, 'contratante');

      expect(contrato.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'aceito' })
      );
    });

    it('aceita contrato quando cachê é zero (guard < 0, Phase 3)', async () => {
      // Phase 3 relaxou o guard de cache_total <= 0 para < 0
      // valor_proposto null gera cache_total = 0, que deve ser permitido
      const contrato = makeContrato({ cache_total: 0 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.acceptContract(1, 1, 'contratante')).resolves.toBe(contrato);
    });

    it('lança erro quando cachê é negativo', async () => {
      const contrato = makeContrato({ cache_total: -1 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.acceptContract(1, 1, 'contratante')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança erro quando contratante já aceitou', async () => {
      const contrato = makeContrato({ cache_total: 5000, aceite_contratante: true });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.acceptContract(1, 1, 'contratante')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança erro quando contrato não pode ser aceito no status atual', async () => {
      const contrato = makeContrato({ status: 'cancelado', cache_total: 5000 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.acceptContract(1, 1, 'contratante')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── cancelContract ───────────────────────────────────────────────────────
  describe('cancelContract', () => {
    it('cancela contrato e calcula penalidade > 72h', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // mais de 72h
      const contrato = makeContrato({ data_evento: futureDate });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      const result = await service.cancelContract(1, 1, 'contratante', 'Motivo');

      expect(contrato.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelado' })
      );
      expect(result.penalidade_percentual).toBe(0);
    });

    it('calcula penalidade entre 24-72h', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2); // ~48h
      const contrato = makeContrato({ data_evento: futureDate });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      const result = await service.cancelContract(1, 1, 'contratante', 'Motivo');

      expect(result.penalidade_percentual).toBe(50);
    });

    it('lança erro quando contrato já finalizado', async () => {
      const contrato = makeContrato({ status: 'cancelado' });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.cancelContract(1, 1, 'contratante', 'Motivo')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── completeContract ─────────────────────────────────────────────────────
  describe('completeContract', () => {
    it('conclui contrato aceito', async () => {
      const contrato = makeContrato({ status: 'aceito' });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (BandMemberModel.findAll as jest.Mock).mockResolvedValue([]);
      (ArtistProfileModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await service.completeContract(1);

      expect(contrato.update).toHaveBeenCalledWith({ status: 'concluido' });
      expect(result).toBe(contrato);
    });

    it('lança erro quando contrato não está aceito', async () => {
      const contrato = makeContrato({ status: 'rascunho' });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.completeContract(1)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── proposeEdit ──────────────────────────────────────────────────────────
  describe('proposeEdit', () => {
    it('aplica alterações válidas e reseta aceites', async () => {
      const contrato = makeContrato({ cache_total: 3000, percentual_sinal: 50 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (ContractHistoryModel.bulkCreate as jest.Mock).mockResolvedValue([]);

      await service.proposeEdit(1, 1, 'contratante', { cache_total: 5000 } as any);

      expect(contrato.update).toHaveBeenCalledWith(
        expect.objectContaining({
          aceite_contratante: false,
          aceite_contratado: false,
          status: 'rascunho',
        })
      );
      expect(ContractHistoryModel.bulkCreate).toHaveBeenCalled();
    });

    it('lança erro quando nenhuma alteração válida', async () => {
      const contrato = makeContrato();
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(
        service.proposeEdit(1, 1, 'contratante', {} as any)
      ).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança erro quando contrato não pode ser editado', async () => {
      const contrato = makeContrato({ status: 'cancelado' });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(
        service.proposeEdit(1, 1, 'contratante', { cache_total: 5000 } as any)
      ).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── cancelContract — contratado ──────────────────────────────────────────
  describe('cancelContract — contratado', () => {
    it('aplica penalidade de 20% para contratado que cancela com < 72h', async () => {
      const nearDate = new Date();
      nearDate.setHours(nearDate.getHours() + 24); // ~24h
      const contrato = makeContrato({ data_evento: nearDate });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (ContractHistoryModel.create as jest.Mock).mockResolvedValue({});
      contrato.reload = jest.fn().mockResolvedValue(contrato);

      const result = await service.cancelContract(1, 1, 'contratado', 'Emergência');

      expect(result.penalidade_percentual).toBe(20);
      expect(contrato.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelado' })
      );
    });

    it('sem penalidade para contratado que cancela com > 72h', async () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 10);
      const contrato = makeContrato({ data_evento: farDate });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (ContractHistoryModel.create as jest.Mock).mockResolvedValue({});
      contrato.reload = jest.fn().mockResolvedValue(contrato);

      const result = await service.cancelContract(1, 1, 'contratado', 'Motivo');

      expect(result.penalidade_percentual).toBe(0);
    });

    it('lança 400 quando contrato já está concluído', async () => {
      const contrato = makeContrato({ status: 'concluido' });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);

      await expect(service.cancelContract(1, 1, 'contratante', 'Motivo')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── completeContract — incrementos ───────────────────────────────────────
  describe('completeContract — incrementos', () => {
    it('incrementa shows_realizados do artista individual ao concluir', async () => {
      const contrato = makeContrato({ status: 'aceito', artista_id: 7 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (ArtistProfileModel.increment as jest.Mock).mockResolvedValue(undefined);
      (EstablishmentProfileModel.increment as jest.Mock).mockResolvedValue(undefined);
      contrato.reload = jest.fn().mockResolvedValue(contrato);

      await service.completeContract(1);

      expect(ArtistProfileModel.increment).toHaveBeenCalledWith(
        'shows_realizados',
        expect.objectContaining({ by: 1, where: { id: 7 } })
      );
    });

    it('incrementa shows_realizados dos membros da banda ao concluir', async () => {
      const contrato = makeContrato({ status: 'aceito', banda_id: 5 });
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (BandMemberModel.findAll as jest.Mock).mockResolvedValue([
        { perfil_artista_id: 10 },
        { perfil_artista_id: 11 },
      ]);
      (ArtistProfileModel.increment as jest.Mock).mockResolvedValue(undefined);
      (EstablishmentProfileModel.increment as jest.Mock).mockResolvedValue(undefined);
      contrato.reload = jest.fn().mockResolvedValue(contrato);

      await service.completeContract(1);

      expect(ArtistProfileModel.increment).toHaveBeenCalledWith(
        'shows_realizados',
        expect.objectContaining({ where: { id: [10, 11] } })
      );
    });
  });

  // ─── getByEvent ────────────────────────────────────────────────────────────
  describe('getByEvent', () => {
    it('retorna contrato quando existe para o evento', async () => {
      const contrato = makeContrato();
      (ContractModel.findOne as jest.Mock).mockResolvedValue(contrato);

      const result = await service.getByEvent(20);

      expect(result).toBe(contrato);
      expect(ContractModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { evento_id: 20 } })
      );
    });

    it('retorna null quando não há contrato para o evento', async () => {
      (ContractModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getByEvent(999);

      expect(result).toBeNull();
    });
  });

  // ─── getHistory ────────────────────────────────────────────────────────────
  describe('getHistory', () => {
    it('retorna histórico de alterações do contrato', async () => {
      const contrato = makeContrato();
      const historico = [{ id: 1, campo_alterado: 'status' }];
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (ContractHistoryModel.findAll as jest.Mock).mockResolvedValue(historico);

      const result = await service.getHistory(1);

      expect(result).toBe(historico);
      expect(ContractHistoryModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { contrato_id: 1 } })
      );
    });

    it('lança 404 quando contrato não encontrado', async () => {
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.getHistory(999)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  // ─── getUserRole ──────────────────────────────────────────────────────────
  describe('getUserRole', () => {
    it('retorna contratante quando é dono do estabelecimento', async () => {
      const contrato = makeContrato();
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 1 });

      const result = await service.getUserRole(1, 1);
      expect(result).toBe('contratante');
    });

    it('retorna contratado quando é líder da banda', async () => {
      const contrato = makeContrato();
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 99 });
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      const result = await service.getUserRole(1, 1);
      expect(result).toBe('contratado');
    });

    it('retorna null quando não é parte do contrato', async () => {
      const contrato = makeContrato();
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(contrato);
      (EstablishmentProfileModel.findByPk as jest.Mock).mockResolvedValue({ usuario_id: 99 });
      (BandMemberModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserRole(1, 1);
      expect(result).toBeNull();
    });

    it('retorna null quando contrato não existe', async () => {
      (ContractModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserRole(999, 1);
      expect(result).toBeNull();
    });
  });
});
