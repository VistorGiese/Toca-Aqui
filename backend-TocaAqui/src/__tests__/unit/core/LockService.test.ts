process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'super-secret-key-for-tests-only-32chars';

jest.mock('../../../config/redis', () => ({
  __esModule: true,
  default: { getClient: jest.fn() },
}));

import redisService from '../../../config/redis';
import { LockService } from '../../../services/LockService';

const mockSet = jest.fn();
const mockEval = jest.fn();

describe('LockService', () => {
  let service: LockService;

  beforeEach(() => {
    jest.clearAllMocks();
    (redisService.getClient as jest.Mock).mockReturnValue({ set: mockSet, eval: mockEval });
    service = new LockService();
  });

  describe('acquire', () => {
    it('retorna acquired=true quando o lock é adquirido (set resolve "OK")', async () => {
      mockSet.mockResolvedValue('OK');

      const result = await service.acquire('lock:teste', 5000);

      expect(result.acquired).toBe(true);
      expect(typeof result.token).toBe('string');
      expect(mockSet).toHaveBeenCalledWith('lock:teste', result.token, 'PX', 5000, 'NX');
    });

    it('retorna acquired=false quando o lock já está em uso (set resolve null)', async () => {
      mockSet.mockResolvedValue(null);

      const result = await service.acquire('lock:teste', 5000);

      expect(result.acquired).toBe(false);
      expect(typeof result.token).toBe('string');
    });

    it('retorna acquired=true (fail-open) quando o Redis está indisponível', async () => {
      mockSet.mockRejectedValue(new Error('Redis indisponível'));

      const result = await service.acquire('lock:teste', 5000);

      expect(result.acquired).toBe(true);
      expect(typeof result.token).toBe('string');
    });
  });

  describe('release', () => {
    it('chama eval com o script de compare-and-delete, a key e o token', async () => {
      mockEval.mockResolvedValue(1);

      await service.release('lock:teste', 'token-abc');

      expect(mockEval).toHaveBeenCalledWith(expect.any(String), 1, 'lock:teste', 'token-abc');
    });

    it('não lança quando eval rejeita', async () => {
      mockEval.mockRejectedValue(new Error('Redis indisponível'));

      await expect(service.release('lock:teste', 'token-abc')).resolves.toBeUndefined();
    });
  });
});
