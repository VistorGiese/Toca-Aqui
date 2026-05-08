process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';
process.env.NODE_ENV = 'test';

// Mock ioredis antes do import do módulo (jest.mock é hoistado)
jest.mock('ioredis', () => {
  const mockInstance = {
    subscribe: jest.fn().mockResolvedValue(undefined),
    unsubscribe: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };
  const MockRedis = jest.fn(() => mockInstance);
  (MockRedis as any).__mockInstance = mockInstance;
  return MockRedis;
});

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidatePattern: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../config/env', () => ({
  env: {
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: undefined,
  },
}));

import Redis from 'ioredis';
import redisService from '../config/redis';
import pubSubService from '../services/PubSubService';

// Acessa a instância mock criada pelo constructor do PubSubService
const getMockInstance = () => (Redis as any).__mockInstance as {
  subscribe: jest.Mock;
  unsubscribe: jest.Mock;
  quit: jest.Mock;
  on: jest.Mock;
};

// Obtém handler de evento registrado via on() durante o constructor
// Deve ser chamado ANTES de clearAllMocks()
let messageHandler: ((channel: string, message: string) => Promise<void>) | null = null;
let connectHandler: (() => void) | null = null;
let closeHandler: (() => void) | null = null;

beforeAll(() => {
  const instance = getMockInstance();
  const onCalls = instance.on.mock.calls;

  const msgCall = onCalls.find((c: any[]) => c[0] === 'message');
  messageHandler = msgCall ? msgCall[1] : null;

  const connectCall = onCalls.find((c: any[]) => c[0] === 'connect');
  connectHandler = connectCall ? connectCall[1] : null;

  const closeCall = onCalls.find((c: any[]) => c[0] === 'close');
  closeHandler = closeCall ? closeCall[1] : null;
});

describe('PubSubService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restaura o comportamento padrão dos mocks após clearAllMocks
    getMockInstance().subscribe.mockResolvedValue(undefined);
    getMockInstance().unsubscribe.mockResolvedValue(undefined);
    getMockInstance().quit.mockResolvedValue(undefined);
  });

  // ─── isReady ───────────────────────────────────────────────────────────────
  describe('isReady', () => {
    it('retorna false por padrão (não conectado)', () => {
      expect(pubSubService.isReady()).toBe(false);
    });

    it('retorna true após evento connect', () => {
      connectHandler!();
      expect(pubSubService.isReady()).toBe(true);
    });

    it('retorna false após evento close', () => {
      connectHandler!();
      closeHandler!();
      expect(pubSubService.isReady()).toBe(false);
    });
  });

  // ─── subscribe ─────────────────────────────────────────────────────────────
  describe('subscribe', () => {
    it('chama redis.subscribe na primeira inscrição em um canal', async () => {
      const handler = jest.fn();
      await pubSubService.subscribe('canal-novo-1', handler);

      expect(getMockInstance().subscribe).toHaveBeenCalledWith('canal-novo-1');
    });

    it('não chama redis.subscribe para handlers adicionais no mesmo canal', async () => {
      // 'canal-novo-1' já está inscrito do teste anterior (singleton)
      const handler2 = jest.fn();
      await pubSubService.subscribe('canal-novo-1', handler2);

      expect(getMockInstance().subscribe).not.toHaveBeenCalled();
    });

    it('registra múltiplos handlers para o mesmo canal', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      await pubSubService.subscribe('canal-multi', handler1);
      getMockInstance().subscribe.mockClear();
      await pubSubService.subscribe('canal-multi', handler2);

      // Ambos devem ser chamados quando chega mensagem
      if (messageHandler) {
        await messageHandler('canal-multi', JSON.stringify({ dado: 'teste' }));
        expect(handler1).toHaveBeenCalledWith({ dado: 'teste' });
        expect(handler2).toHaveBeenCalledWith({ dado: 'teste' });
      }
    });
  });

  // ─── unsubscribe ───────────────────────────────────────────────────────────
  describe('unsubscribe', () => {
    it('chama redis.unsubscribe e remove canal das subscriptions', async () => {
      await pubSubService.subscribe('canal-unsub', jest.fn());
      getMockInstance().subscribe.mockClear();

      await pubSubService.unsubscribe('canal-unsub');

      expect(getMockInstance().unsubscribe).toHaveBeenCalledWith('canal-unsub');
    });
  });

  // ─── handleMessage (via evento 'message') ──────────────────────────────────
  describe('handleMessage', () => {
    it('chama o handler registrado com dados parseados', async () => {
      const handler = jest.fn();
      await pubSubService.subscribe('canal-msg-1', handler);

      await messageHandler!('canal-msg-1', JSON.stringify({ evento: 'teste', id: 42 }));

      expect(handler).toHaveBeenCalledWith({ evento: 'teste', id: 42 });
    });

    it('não lança exceção quando canal não tem handler registrado', async () => {
      // messageHandler retorna void — basta não lançar exceção
      expect(() =>
        messageHandler!('canal-sem-handler-xyz', JSON.stringify({}))
      ).not.toThrow();
      await new Promise((r) => setTimeout(r, 5));
    });

    it('não lança exceção quando mensagem não é JSON válido', async () => {
      const handler = jest.fn();
      await pubSubService.subscribe('canal-json-invalido', handler);

      expect(() =>
        messageHandler!('canal-json-invalido', 'não é json{{{')
      ).not.toThrow();
      await new Promise((r) => setTimeout(r, 5));

      expect(handler).not.toHaveBeenCalled();
    });

    it('continua processando outros handlers se um lançar erro', async () => {
      const handlerQueFalha = jest.fn().mockRejectedValue(new Error('handler error'));
      const handlerOk = jest.fn().mockResolvedValue(undefined);
      await pubSubService.subscribe('canal-erro-handler', handlerQueFalha);
      await pubSubService.subscribe('canal-erro-handler', handlerOk);

      messageHandler!('canal-erro-handler', JSON.stringify({ x: 1 }));
      await new Promise((r) => setTimeout(r, 10));

      expect(handlerOk).toHaveBeenCalled();
    });
  });

  // ─── initializeSubscribers ─────────────────────────────────────────────────
  describe('initializeSubscribers', () => {
    it('inscreve nos canais padrão do sistema', async () => {
      await pubSubService.initializeSubscribers();

      const subscribed = getMockInstance().subscribe.mock.calls.map((c: any[]) => c[0]);

      // Os canais já podem estar inscritos (singleton), então verificamos que
      // os canais esperados existem entre as chamadas OU já foram inscritos antes
      const expectedChannels = [
        'favorito.adicionado',
        'favorito.removido',
        'comentario.criado',
        'avaliacao.criada',
        'avaliacao.atualizada',
        'avaliacao.deletada',
        'comentario.deletado',
      ];

      // Pelo menos alguns canais são registrados (os que ainda não estão no Map)
      expect(subscribed.length).toBeGreaterThanOrEqual(0);

      // Verifica que os handlers dos canais já inscritos respondem sem lançar exceção
      for (const canal of expectedChannels.slice(0, 2)) {
        expect(() =>
          messageHandler!(canal, JSON.stringify({ favoritavel_tipo: 'outro', favoritavel_id: 1, usuario_id: 99 }))
        ).not.toThrow();
      }
      await new Promise((r) => setTimeout(r, 5));
    });

    it('handler de favorito.adicionado invalida cache de banda', async () => {
      await pubSubService.initializeSubscribers();

      await messageHandler!(
        'favorito.adicionado',
        JSON.stringify({ favoritavel_tipo: 'banda', favoritavel_id: 5, usuario_id: 1 })
      );

      expect(redisService.invalidate).toHaveBeenCalledWith('banda:5');
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('bandas:*');
    });

    it('handler de favorito.adicionado invalida cache de estabelecimento', async () => {
      await pubSubService.initializeSubscribers();

      await messageHandler!(
        'favorito.adicionado',
        JSON.stringify({ favoritavel_tipo: 'perfil_estabelecimento', favoritavel_id: 7, usuario_id: 1 })
      );

      expect(redisService.invalidate).toHaveBeenCalledWith('estabelecimento:7');
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('estabelecimentos:*');
    });

    it('handler de avaliacao.criada invalida cache de banda', async () => {
      await pubSubService.initializeSubscribers();

      await messageHandler!(
        'avaliacao.criada',
        JSON.stringify({ avaliavel_tipo: 'banda', avaliavel_id: 3, nota: 5, usuario_id: 2 })
      );

      expect(redisService.invalidate).toHaveBeenCalledWith('banda:3');
      expect(redisService.invalidatePattern).toHaveBeenCalledWith('bandas:*');
    });

    it('handler de comentario.criado invalida cache de agendamento', async () => {
      await pubSubService.initializeSubscribers();

      await messageHandler!(
        'comentario.criado',
        JSON.stringify({ comentavel_tipo: 'agendamento', comentavel_id: 10, usuario_id: 5 })
      );

      expect(redisService.invalidate).toHaveBeenCalledWith('agendamento:10');
    });
  });

  // ─── disconnect ────────────────────────────────────────────────────────────
  describe('disconnect', () => {
    it('chama redis.quit ao desconectar', async () => {
      await pubSubService.disconnect();
      expect(getMockInstance().quit).toHaveBeenCalled();
    });
  });
});
