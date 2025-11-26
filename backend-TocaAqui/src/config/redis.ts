import Redis from 'ioredis';

class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      console.log('Redis conectado com sucesso!');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Erro no Redis:', error.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Conexão com Redis fechada');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Reconectando ao Redis...');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis health check falhou:', error);
      return false;
    }
  }

  public isRedisConnected(): boolean {
    return this.isConnected;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.client.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Erro ao buscar cache [${key}]:`, error);
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar cache [${key}]:`, error);
    }
  }

  public async invalidate(key: string): Promise<void> {
    try {
      await this.client.del(key);
      console.log(`Cache invalidado: ${key}`);
    } catch (error) {
      console.error(`Erro ao invalidar cache [${key}]:`, error);
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`Cache invalidado (${keys.length} chaves): ${pattern}`);
      }
    } catch (error) {
      console.error(`Erro ao invalidar padrão [${pattern}]:`, error);
    }
  }


  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Erro ao verificar existência [${key}]:`, error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('Redis desconectado');
  }
}

export default RedisService.getInstance();
