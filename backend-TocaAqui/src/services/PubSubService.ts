import Redis from "ioredis";
import redisService from "../config/redis";


class PubSubService {
  private subscriber: Redis;
  private isConnected: boolean = false;
  private subscriptions: Map<string, Set<Function>> = new Map();

  constructor() {
    // criar cliente Redis dedicado para subscription
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.subscriber.on("connect", () => {
      this.isConnected = true;
      console.log("[API Principal] Redis Subscriber conectado");
    });

    this.subscriber.on("error", (error) => {
      console.error("[API Principal] Erro no Redis Subscriber:", error.message);
    });

    this.subscriber.on("close", () => {
      this.isConnected = false;
      console.log("[API Principal] Redis Subscriber desconectado");
    });

    this.subscriber.on("message", (channel: string, message: string) => {
      this.handleMessage(channel, message);
    });
  }

  async subscribe(channel: string, handler: (data: any) => void | Promise<void>): Promise<void> {
    try {
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());

        await this.subscriber.subscribe(channel);
        console.log(`[PubSub] Inscrito no canal: "${channel}"`);
      }

      this.subscriptions.get(channel)!.add(handler);
      console.log(`Handler registrado para "${channel}"`);
    } catch (error) {
      console.error(`[PubSub] Erro ao se inscrever no canal "${channel}":`, error);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
      this.subscriptions.delete(channel);
      console.log(`[PubSub] Desinscrito do canal: "${channel}"`);
    } catch (error) {
      console.error(`[PubSub] Erro ao desinscrever do canal "${channel}":`, error);
    }
  }


  private async handleMessage(channel: string, message: string): Promise<void> {
    try {
      const data = JSON.parse(message);
      console.log(`[PubSub] Evento recebido do canal "${channel}":`, data);

      const handlers = this.subscriptions.get(channel);
      if (handlers && handlers.size > 0) {
        for (const handler of handlers) {
          try {
            await handler(data);
          } catch (error) {
            console.error(`[PubSub] Erro ao executar handler para "${channel}":`, error);
          }
        }
      } else {
        console.warn(`[PubSub] Nenhum handler registrado para "${channel}"`);
      }
    } catch (error) {
      console.error(`[PubSub] Erro ao processar mensagem do canal "${channel}":`, error);
    }
  }

  async initializeSubscribers(): Promise<void> {
    console.log("[PubSub] Inicializando subscribers...");

    await this.subscribe("favorito.adicionado", async (data) => {
      console.log(`Favorito adicionado: ${data.favoritavel_tipo} #${data.favoritavel_id} por usuário #${data.usuario_id}`);
      
      // invalidar caches relacionados
      if (data.favoritavel_tipo === "banda") {
        await redisService.invalidate(`banda:${data.favoritavel_id}`);
        await redisService.invalidate(`bandas:list`);
        await redisService.invalidatePattern(`bandas:*`);
        console.log(` Cache invalidado para banda #${data.favoritavel_id}`);
      } else if (data.favoritavel_tipo === "perfil_estabelecimento") {
        await redisService.invalidate(`estabelecimento:${data.favoritavel_id}`);
        await redisService.invalidatePattern(`estabelecimentos:*`);
        console.log(` Cache invalidado para estabelecimento #${data.favoritavel_id}`);
      }
    });

    await this.subscribe("favorito.removido", async (data) => {
      console.log(`Favorito removido: ${data.favoritavel_tipo} #${data.favoritavel_id} por usuário #${data.usuario_id}`);
      

      if (data.favoritavel_tipo === "banda") {
        await redisService.invalidate(`banda:${data.favoritavel_id}`);
        await redisService.invalidatePattern(`bandas:*`);
      }
    });


    await this.subscribe("comentario.criado", async (data) => {
      console.log(`Comentário criado: ${data.comentavel_tipo} #${data.comentavel_id} por usuário #${data.usuario_id}`);
      
      if (data.comentavel_tipo === "banda") {
        await redisService.invalidate(`banda:${data.comentavel_id}:detalhes`);
      } else if (data.comentavel_tipo === "agendamento") {
        await redisService.invalidate(`agendamento:${data.comentavel_id}`);
      }
    });


    await this.subscribe("avaliacao.criada", async (data) => {
      console.log(`Avaliação criada: ${data.avaliavel_tipo} #${data.avaliavel_id} - Nota: ${data.nota} por usuário #${data.usuario_id}`);
      

      if (data.avaliavel_tipo === "banda") {
        await redisService.invalidate(`banda:${data.avaliavel_id}:rating`);
        await redisService.invalidate(`banda:${data.avaliavel_id}:detalhes`);
        await redisService.invalidatePattern(`bandas:top*`);
        console.log(`Cache de avaliações invalidado para banda #${data.avaliavel_id}`);
      }
    });

    await this.subscribe("avaliacao.atualizada", async (data) => {
      console.log(`Avaliação atualizada: ${data.avaliavel_tipo} #${data.avaliavel_id} - Nova nota: ${data.nota_nova}`);
      
      if (data.avaliavel_tipo === "banda") {
        await redisService.invalidate(`banda:${data.avaliavel_id}:rating`);
        await redisService.invalidatePattern(`bandas:top*`);
      }
    });

    await this.subscribe("avaliacao.deletada", async (data) => {
      console.log(`Avaliação deletada: ${data.avaliavel_tipo} #${data.avaliavel_id}`);
      
      if (data.avaliavel_tipo === "banda") {
        await redisService.invalidate(`banda:${data.avaliavel_id}:rating`);
        await redisService.invalidatePattern(`bandas:top*`);
      }
    });

    console.log("[PubSub] Subscribers inicializados com sucesso!");
  }

  isReady(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    for (const channel of this.subscriptions.keys()) {
      await this.unsubscribe(channel);
    }
    await this.subscriber.quit();
    console.log("[API Principal] Redis Subscriber desconectado");
  }
}


const pubSubService = new PubSubService();
export default pubSubService;
