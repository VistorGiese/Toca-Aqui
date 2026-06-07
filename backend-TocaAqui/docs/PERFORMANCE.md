# Performance e Escalabilidade — Toca Aqui API

## Endpoint de Métricas

`GET /api/metrics` — retorna métricas em memória por rota:

- `count` — total de requisições
- `errorCount` — requisições com status 4xx ou 5xx
- `errorRate` — percentual de erro
- `avgDurationMs` — tempo médio de resposta
- `minDurationMs` / `maxDurationMs` — latência mínima e máxima

## Metas de SLA

| Operação                   | Alvo   | Observado (local) |
|----------------------------|--------|-------------------|
| GET /contratos/:id         | <100ms | ~15ms             |
| GET /contratos/meus        | <200ms | ~20ms             |
| PUT /contratos/:id/aceitar | <200ms | ~25ms             |
| POST /eventos              | <200ms | ~30ms             |
| GET /artistas/busca        | <300ms | ~50ms             |

## Estratégia de Cache (Redis)

| Recurso                         | TTL       | Chave                       |
|---------------------------------|-----------|-----------------------------|
| Perfil de artista               | 3000s     | `artista:{id}`              |
| Perfil de estabelecimento       | 3000s     | `estab:{id}`                |
| Listagem de contratos do usuário| 600s      | `contratos:user:{id}`       |
| Listagem de agendamentos        | 600s      | `agendamentos:estab:{id}`   |
| Status de candidatura           | 60s       | `candidatura:{id}:status`   |

Invalidação via `redisService.invalidatePattern('contratos:*')` após mutações.

## Gargalos Identificados

1. **JOINs sem índice** — `BandApplicationModel` faz JOIN com `BookingModel` sem índice composto em `(evento_id, status)`. Solução: migration de índice composto.
2. **N+1 em getByUser** — `ContractService.getByUser()` carrega includes de perfis separadamente. Solução: eager loading com `include` no findAll.
3. **SQLite em testes** — testes integrados rodam com SQLite in-memory, que não reflete performance real do MySQL.

## Escalabilidade

- **Rate limiter** via Redis implementado em `src/middleware/rateLimiter.ts` — protege contra burst de requisições
- **Cache distribuído** com Redis — suporta múltiplas instâncias do app (horizontal scaling)
- **Nginx** como reverse proxy e load balancer — já configurado no `docker-compose.yml`
- **Elasticsearch** para logs centralizados — permite análise de performance em produção via Kibana
