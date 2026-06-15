# Controle de concorrência: lock distribuído em `BandApplicationService.accept()`

Este documento descreve o mecanismo de **lock distribuído via Redis** usado para evitar uma condição de corrida no aceite de candidaturas, e como visualizar os logs de aquisição/liberação do lock no Grafana/Loki.

## Cenário de corrida

`BandApplicationService.accept()` (`src/services/BandApplicationService.ts`) aceita uma candidatura (`BandApplicationModel`) para um evento (`agendamentos`). Antes de marcar a candidatura como `aceito`, o serviço verifica se já existe outra candidatura `aceito` para o mesmo `evento_id` (`jaAprovada`).

Sem um lock, duas chamadas concorrentes de `accept()` para **candidaturas diferentes do mesmo evento** podem ambas passar pela checagem `jaAprovada` antes de qualquer `update` ser persistido, resultando em **2 candidaturas aceitas e 2 contratos gerados para o mesmo evento**.

## Mecanismo de lock

`src/services/LockService.ts` implementa um lock distribuído single-instance sobre o Redis já configurado em `src/config/redis.ts` (`ioredis`):

- **Aquisição** — `SET key token PX <ttl> NX`: só obtém sucesso (`'OK'`) se a chave ainda não existir. O `token` é um UUID gerado por requisição.
- **Liberação** — script Lua de *compare-and-delete*: só remove a chave se o valor armazenado for igual ao `token` que a adquiriu, evitando que uma requisição libere o lock de outra (ex: após o TTL expirar e outra requisição já ter adquirido).
- **TTL** — 5000ms, suficiente para o fluxo de `accept()` (updates + geração de contrato + notificações) sem travar indefinidamente em caso de falha.
- **Chave** — `lock:band-application:accept:evento:<evento_id>` — escopo por evento, permitindo aceites concorrentes em eventos diferentes.
- **Fail-open** — se o Redis estiver indisponível, `acquire()` retorna `acquired: true` (não bloqueia o fluxo principal do TCC por uma falha de infraestrutura secundária).

### Fluxo em `accept()`

```ts
const lockKey = `lock:band-application:accept:evento:${aplicacao.evento_id}`;
const lock = await lockService.acquire(lockKey, 5000);
if (!lock.acquired) {
  throw new AppError('Outra candidatura está sendo processada para este evento. Tente novamente em alguns segundos.', 409);
}

try {
  return await this.acceptAfterLock(aplicacao);
} finally {
  await lockService.release(lockKey, lock.token);
}
```

Se duas chamadas concorrentes de `accept()` chegarem para o mesmo `evento_id`, a segunda recebe `lock.acquired === false` e lança **`AppError 409`** imediatamente, sem tocar nos models. O lock é sempre liberado no `finally`, mesmo que `acceptAfterLock` lance um erro de negócio (ex: banda inativa, evento cancelado).

## Logs

`LockService` loga cada operação via winston (`src/utils/logger.ts`), que envia para o Loki configurado por `LOKI_URL`:

| Evento | Nível | Quando |
|---|---|---|
| `lock.acquired` | info | Lock adquirido com sucesso — inclui `key`, `token`, `ttlMs` |
| `lock.busy` | warn | Lock já estava em uso (outra requisição em andamento) |
| `lock.released` | info | Lock liberado com sucesso após o processamento |
| `lock.acquire.error` | error | Falha ao falar com o Redis durante `acquire` (fail-open) |
| `lock.release.error` | error | Falha ao falar com o Redis durante `release` |

### Visualizando no Grafana

Com a stack de observabilidade (`docker-compose up`), o Grafana fica disponível em `http://localhost:3001` com o datasource Loki e o dashboard `toca-aqui-logs` já provisionados (`grafana/provisioning/`). Para acompanhar o ciclo de vida do lock, filtre os logs do serviço `toca-aqui-api` pela mensagem `lock.` (ex: `{app="toca-aqui-api"} |= "lock."`).

## Resposta ao cliente

Quando o lock está ocupado, o endpoint de aceite responde:

```json
{
  "message": "Outra candidatura está sendo processada para este evento. Tente novamente em alguns segundos."
}
```
com status **`409 Conflict`**.
