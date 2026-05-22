# Plano de Observabilidade — Toca Aqui

Este documento descreve o plano de observabilidade da plataforma, cobrindo o estado atual (logs básicos) e o que deve ser implementado para suportar um ambiente de produção.

---

## Estado Atual

A observabilidade está em estágio inicial. O sistema conta com:

- **Logs de console** via Express (erros capturados pelo `errorHandler` são logados com stack trace).
- **Testes automatizados** cobrindo a maioria do código de serviços, controllers e middlewares (Jest, rodando no CI).
- **Health checks** dos containers MySQL e Redis via Docker Compose.

Não há ferramenta de APM, coleta de métricas ou sistema de alertas implantado.

---

## Pilares de Observabilidade

### 1. Logs

**Atual:** `console.error` no `errorHandler` e logs pontuais nos services.

**Planejado:**

| Item | Ferramenta sugerida |
|---|---|
| Structured logging (JSON) | Winston ou Pino |
| Correlação de requisições | `x-request-id` header + middleware de log |
| Retenção de logs de erro | 30 dias mínimo |
| Cobertura de logs | 100% dos endpoints (entrada + saída + erros) |

**Campos mínimos por log:**
- `timestamp`
- `level` (info, warn, error)
- `method` + `path` + `status`
- `duration_ms`
- `request_id`
- `user_id` (quando autenticado)

---

### 2. Métricas

**Atual:** Nenhuma coleta de métricas implantada.

**Planejado:**

| Métrica | Referência SLO |
|---|---|
| Latência de resposta (p50, p90, p95, p99) | ≤ 250 ms no p90 |
| Taxa de erros 5xx | ≤ 0,8% |
| CPU do container `app` | ≤ 68% |
| RAM do container `app` | ≤ 75% |
| Conexões ativas MySQL | monitorar pool de conexões |
| Mensagens Pub/Sub Redis processadas | contagem por canal |

**Ferramenta sugerida:** Prometheus + Grafana (via `prom-client` para Node.js).

---

### 3. Rastreamento (Tracing)

**Atual:** Sem rastreamento distribuído.

**Planejado (pós-MVP):**

- Rastreamento de requisições de ponta a ponta com `x-request-id`.
- Identificação de queries lentas no MySQL via slow query log.
- OpenTelemetry para instrumentação futura se o monolito for quebrado em serviços.

---

## Alertas Planejados

| Condição | Ação |
|---|---|
| CPU do `app` > 80% por mais de 1 minuto | Notificação para time |
| Taxa de erros 5xx > 1% em 5 minutos | Notificação para time |
| Container `app` reiniciado | Notificação para time |
| Falha de health check do MySQL | Notificação para time |
| Latência p95 > 500 ms por 5 minutos | Alerta de degradação |

---

## Runbook Resumido

| Sintoma | Primeira ação |
|---|---|
| API retorna 502 | Verificar `docker compose ps`; reiniciar `app` se necessário |
| API lenta (p95 alto) | Verificar slow queries no MySQL; verificar CPU/RAM dos containers |
| Erros 5xx em série | Verificar logs do `errorHandler`; checar conexão com MySQL e Redis |
| Redis indisponível | Rate limiter e notificações falham; reiniciar container `redis` |
| E-mails não entregues | Verificar credenciais SMTP no `.env`; checar limite diário do Gmail |

---

## Prioridade de Implementação

| Fase | Item |
|---|---|
| Imediato | Structured logging com Winston/Pino |
| Curto prazo | `x-request-id` middleware + correlação de logs |
| Médio prazo | Prometheus + Grafana para métricas |
| Pós-MVP | Alertas automáticos + tracing com OpenTelemetry |
