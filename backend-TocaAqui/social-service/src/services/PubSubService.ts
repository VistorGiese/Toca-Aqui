import Redis from "ioredis";


class PubSubService {
  private publisher: Redis;
  private isConnected: boolean = false;

  constructor() {
    // Criar cliente Redis dedicado para publicação
    this.publisher = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.publisher.on("connect", () => {
      this.isConnected = true;
      console.log("[Social Service] Redis Publisher conectado");
    });

    this.publisher.on("error", (error) => {
      console.error("[Social Service] Erro no Redis Publisher:", error.message);
    });

    this.publisher.on("close", () => {
      this.isConnected = false;
      console.log("[Social Service] Redis Publisher desconectado");
    });
  }


  async publish(channel: string, data: any): Promise<number> {
    try {
      if (!this.isConnected) {
        console.warn("[PubSub] Publisher não conectado, tentando publicar mesmo assim...");
      }

      const message = JSON.stringify(data);
      const subscriberCount = await this.publisher.publish(channel, message);

      console.log(`[PubSub] Evento publicado em "${channel}":`, data);
      console.log(`Subscribers notificados: ${subscriberCount}`);

      return subscriberCount;
    } catch (error) {
      console.error(`[PubSub] Erro ao publicar no canal "${channel}":`, error);
      return 0;
    }
  }


  async publishFavoritoAdicionado(data: {
    usuario_id: number;
    favoritavel_tipo: string;
    favoritavel_id: number;
  }): Promise<number> {
    return this.publish("favorito.adicionado", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  async publishFavoritoRemovido(data: {
    usuario_id: number;
    favoritavel_tipo: string;
    favoritavel_id: number;
  }): Promise<number> {
    return this.publish("favorito.removido", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  async publishComentarioCriado(data: {
    id: number;
    usuario_id: number;
    comentavel_tipo: string;
    comentavel_id: number;
  }): Promise<number> {
    return this.publish("comentario.criado", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  async publishComentarioDeletado(data: {
    id: number;
    comentavel_tipo: string;
    comentavel_id: number;
  }): Promise<number> {
    return this.publish("comentario.deletado", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  async publishAvaliacaoCriada(data: {
    id: number;
    usuario_id: number;
    avaliavel_tipo: string;
    avaliavel_id: number;
    nota: number;
  }): Promise<number> {
    return this.publish("avaliacao.criada", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  async publishAvaliacaoAtualizada(data: {
    id: number;
    avaliavel_tipo: string;
    avaliavel_id: number;
    nota_antiga?: number;
    nota_nova: number;
  }): Promise<number> {
    return this.publish("avaliacao.atualizada", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  async publishAvaliacaoDeletada(data: {
    id: number;
    avaliavel_tipo: string;
    avaliavel_id: number;
  }): Promise<number> {
    return this.publish("avaliacao.deletada", {
      ...data,
      timestamp: new Date().toISOString(),
      service: "social-service",
    });
  }


  isReady(): boolean {
    return this.isConnected;
  }


  async disconnect(): Promise<void> {
    await this.publisher.quit();
    console.log("[Social Service] Redis Publisher desconectado");
  }
}

const pubSubService = new PubSubService();
export default pubSubService;
