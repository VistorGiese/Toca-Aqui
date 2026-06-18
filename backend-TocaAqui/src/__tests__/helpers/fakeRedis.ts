/**
 * Fake client Redis em memória — usado para que `LockService` (que chama
 * `redisService.getClient().set(...)`/`.eval(...)`) funcione de verdade nos
 * testes E2E/Behavior, sem cair no fail-open por falta de `getClient()`.
 */
export function createFakeRedisClient() {
  const store = new Map<string, { value: string; expiresAt: number }>();

  return {
    set: async (key: string, value: string, _mode: string, ttlMs: number, _flag: string) => {
      const existing = store.get(key);
      if (existing && existing.expiresAt > Date.now()) return null; // NX falhou
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      return 'OK';
    },
    eval: async (_script: string, _numKeys: number, key: string, token: string) => {
      const existing = store.get(key);
      if (existing && existing.value === token) {
        store.delete(key);
        return 1;
      }
      return 0;
    },
  };
}

/**
 * Mock completo de `config/redis` (default export), incluindo `getClient()`
 * apontando para um fake client compartilhado — para uso em `jest.mock('../../config/redis', mockRedisModule)`.
 */
export function mockRedisModule() {
  const client = createFakeRedisClient();
  return {
    __esModule: true,
    default: {
      getClient: () => client,
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      setex: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
      del: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn().mockResolvedValue(undefined),
      invalidatePattern: jest.fn().mockResolvedValue(undefined),
      healthCheck: jest.fn().mockResolvedValue(true),
    },
  };
}
