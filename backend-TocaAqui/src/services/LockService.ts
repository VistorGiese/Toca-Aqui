import crypto from 'crypto';
import redisService from '../config/redis';
import logger from '../utils/logger';

export interface LockHandle {
  acquired: boolean;
  token: string;
}

const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export class LockService {
  async acquire(key: string, ttlMs: number): Promise<LockHandle> {
    const token = crypto.randomUUID();
    try {
      const result = await redisService.getClient().set(key, token, 'PX', ttlMs, 'NX');
      const acquired = result === 'OK';
      if (acquired) {
        logger.info('lock.acquired', { key, token, ttlMs });
      } else {
        logger.warn('lock.busy', { key, ttlMs });
      }
      return { acquired, token };
    } catch (err) {
      logger.error('lock.acquire.error', { key, error: (err as Error).message });
      // Fail-open: Redis indisponível não deve travar o fluxo principal
      return { acquired: true, token };
    }
  }

  async release(key: string, token: string): Promise<void> {
    try {
      await redisService.getClient().eval(RELEASE_SCRIPT, 1, key, token);
      logger.info('lock.released', { key, token });
    } catch (err) {
      logger.error('lock.release.error', { key, error: (err as Error).message });
    }
  }
}

export const lockService = new LockService();
