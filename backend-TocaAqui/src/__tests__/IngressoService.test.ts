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

jest.mock('../models/IngressoModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
  IngressoStatus: {
    CONFIRMADO: 'confirmado',
    PENDENTE: 'pendente',
    CANCELADO: 'cancelado',
  },
  IngressoTipo: {
    INTEIRA: 'inteira',
    MEIA_ENTRADA: 'meia_entrada',
    VIP: 'vip',
  },
}));

jest.mock('../models/BookingModel', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

jest.mock('../models/EstablishmentProfileModel', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('../models/AddressModel', () => ({
  __esModule: true,
  default: {},
}));

import { ingressoService } from '../services/IngressoService';
import IngressoModel from '../models/IngressoModel';
import BookingModel from '../models/BookingModel';

const makeShow = (overrides = {}) => ({
  id: 1,
  esta_publico: true,
  data_show: new Date(Date.now() + 7 * 86_400_000), // futuro por padrão
  capacidade_maxima: 100,
  ingressos_vendidos: 0,
  preco_ingresso_inteira: 50,
  preco_ingresso_meia: 25,
  increment: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makePayload = (overrides = {}) => ({
  usuario_id: 1,
  agendamento_id: 1,
  tipo: 'inteira' as const,
  nome_comprador: 'João Silva',
  cpf: '123.456.789-00',
  telefone: '11999990000',
  ...overrides,
});

describe('IngressoService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── comprarIngresso ───────────────────────────────────────────────────────
  describe('comprarIngresso', () => {
    it('compra ingresso inteira com sucesso', async () => {
      const show = makeShow();
      const ingresso = { id: 99, tipo: 'inteira', preco: 50 };

      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(null);
      (IngressoModel.create as jest.Mock).mockResolvedValue(ingresso);

      const result = await ingressoService.comprarIngresso(makePayload());

      expect(IngressoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'inteira', preco: 50 }),
        expect.anything()
      );
      expect(result).toBe(ingresso);
    });

    it('compra ingresso meia entrada com sucesso', async () => {
      const show = makeShow();
      const ingresso = { id: 100, tipo: 'meia_entrada', preco: 25 };

      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(null);
      (IngressoModel.create as jest.Mock).mockResolvedValue(ingresso);

      const result = await ingressoService.comprarIngresso(makePayload({ tipo: 'meia_entrada' }));

      expect(IngressoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'meia_entrada', preco: 25 }),
        expect.anything()
      );
      expect(result).toBe(ingresso);
    });

    it('compra ingresso VIP com preço 1.5x da inteira', async () => {
      const show = makeShow();
      const ingresso = { id: 101, tipo: 'vip', preco: 75 };

      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(null);
      (IngressoModel.create as jest.Mock).mockResolvedValue(ingresso);

      await ingressoService.comprarIngresso(makePayload({ tipo: 'vip' }));

      expect(IngressoModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'vip', preco: 75 }),
        expect.anything()
      );
    });

    it('lança 404 quando show não encontrado ou não público', async () => {
      (BookingModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(ingressoService.comprarIngresso(makePayload())).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança 400 quando show já aconteceu', async () => {
      const showPassado = makeShow({ data_show: new Date('2020-01-01') });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(showPassado);

      await expect(ingressoService.comprarIngresso(makePayload())).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 400 quando show está esgotado', async () => {
      const showEsgotado = makeShow({ capacidade_maxima: 10, ingressos_vendidos: 10 });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(showEsgotado);

      await expect(ingressoService.comprarIngresso(makePayload())).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 400 quando usuário já possui ingresso para o show', async () => {
      (BookingModel.findOne as jest.Mock).mockResolvedValue(makeShow());
      (IngressoModel.findOne as jest.Mock).mockResolvedValue({ id: 50 });

      await expect(ingressoService.comprarIngresso(makePayload())).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('lança 400 quando ingresso inteira não disponível para show sem preço', async () => {
      const show = makeShow({ preco_ingresso_inteira: null });
      (BookingModel.findOne as jest.Mock).mockResolvedValue(show);
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(ingressoService.comprarIngresso(makePayload())).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  // ─── getMeusIngressos ──────────────────────────────────────────────────────
  describe('getMeusIngressos', () => {
    it('retorna todos os ingressos sem filtro', async () => {
      const ingressos = [{ id: 1 }, { id: 2 }];
      (IngressoModel.findAll as jest.Mock).mockResolvedValue(ingressos);

      const result = await ingressoService.getMeusIngressos(1);

      expect(result).toBe(ingressos);
    });

    it('filtra ingressos próximos', async () => {
      (IngressoModel.findAll as jest.Mock).mockResolvedValue([]);

      await ingressoService.getMeusIngressos(1, 'proximos');

      const callArgs = (IngressoModel.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.include[0].where.data_show).toBeDefined();
    });

    it('filtra ingressos passados', async () => {
      (IngressoModel.findAll as jest.Mock).mockResolvedValue([]);

      await ingressoService.getMeusIngressos(1, 'passados');

      const callArgs = (IngressoModel.findAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.include[0].where.data_show).toBeDefined();
    });
  });

  // ─── getIngressoById ───────────────────────────────────────────────────────
  describe('getIngressoById', () => {
    it('retorna ingresso quando encontrado e pertence ao usuário', async () => {
      const ingresso = { id: 1, usuario_id: 10 };
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(ingresso);

      const result = await ingressoService.getIngressoById(1, 10);

      expect(result).toBe(ingresso);
    });

    it('lança 404 quando ingresso não encontrado', async () => {
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(ingressoService.getIngressoById(999, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('lança 401 quando ingresso pertence a outro usuário', async () => {
      const ingresso = { id: 1, usuario_id: 99 };
      (IngressoModel.findOne as jest.Mock).mockResolvedValue(ingresso);

      await expect(ingressoService.getIngressoById(1, 10)).rejects.toEqual(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
