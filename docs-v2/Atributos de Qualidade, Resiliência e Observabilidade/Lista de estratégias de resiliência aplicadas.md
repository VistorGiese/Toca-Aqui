# Estratégias de Resiliência Aplicadas — Toca Aqui

Este documento lista as estratégias de resiliência implementadas no sistema, organizadas por camada.

---

## 1. Reinício Automático de Containers

**Estratégia:** Self-healing via Docker Compose

Todos os containers do stack têm a política `restart: unless-stopped`. Em caso de falha do processo, o Docker reinicia o container automaticamente sem intervenção manual.

| Container | Política |
|---|---|
| `app` | unless-stopped |
| `mysql` | unless-stopped |
| `redis` | unless-stopped |
| `nginx` | unless-stopped |

---

## 2. Health Checks com Dependência Ordenada

**Estratégia:** Dependency ordering com health check

O container `app` só sobe após `mysql` e `redis` passarem em seus respectivos health checks (`condition: service_healthy`), evitando falhas de startup por banco ou cache indisponíveis.

| Container | Health check |
|---|---|
| `mysql` | `mysqladmin ping -h localhost` |
| `redis` | `redis-cli ping` |

---

## 3. Tratamento Centralizado de Erros

**Estratégia:** Error boundary no Express

O middleware `errorHandler` captura todos os erros não tratados nas rotas e controllers, retornando respostas padronizadas sem expor stack traces ao cliente. Usa a classe `AppError` para erros de negócio com HTTP status codes semânticos.

```
Request → Route → Controller → Service
                                  ↓ throw AppError
                              errorHandler middleware
                                  ↓
                          Resposta JSON padronizada
```

---

## 4. Validação de Entrada com Zod

**Estratégia:** Fail-fast na borda do sistema

Todos os endpoints com body utilizam o middleware `validate` com schemas Zod. Requisições inválidas são rejeitadas com HTTP 400 antes de atingir a camada de serviço, protegendo a integridade dos dados e evitando erros em produção por dados malformados.

---

## 5. Rate Limiting por IP

**Estratégia:** Circuit breaker de taxa de requisições

O middleware `rateLimiter` usa Redis para controlar o número de requisições por IP em uma janela de tempo. Protege endpoints sensíveis (como login) contra força bruta e sobrecarga.

- Armazenamento de contadores no Redis (TTL automático).
- Resposta HTTP 429 com header `Retry-After`.

---

## 6. Persistência de Dados com Volume Docker

**Estratégia:** Durabilidade de dados

MySQL e Redis utilizam volumes nomeados do Docker (`mysql_data`, `redis_data`), garantindo que os dados sobrevivam a reinícios e recriações de containers.

Redis configurado com `--appendonly yes` para persistência de dados em disco (AOF — Append Only File).

---

## 7. Geração de Contrato sem Falha Silenciosa

**Estratégia:** Fail loudly em operações críticas

O `BandApplicationService.accept()` não suprime erros da geração de contrato. Se `ContractService.generateFromApplication()` falhar, o erro é propagado e a candidatura não é marcada como aceita. Isso garante que nunca exista um aceite sem contrato associado.

---

## 8. Guard para Queries com Arrays Vazios

**Estratégia:** Defensive programming no ORM

O `ContractService.getByUser()` possui guard para o caso de `Op.or: []` (array vazio), que causaria crash no MySQL ao ser traduzido para SQL inválido. O guard retorna lista vazia antes de atingir o banco.

---

## 9. Interceptor de 401 no Frontend

**Estratégia:** Token refresh automático e redirecionamento de sessão

O `http/api.ts` do frontend configura um interceptor Axios que, ao receber HTTP 401, aciona `setOnUnauthorized()` para deslogar o usuário e redirecioná-lo para a tela de login, evitando estados inconsistentes de autenticação no app.

---

## Estratégias planejadas (não implementadas)

| Estratégia | Motivo do adiamento |
|---|---|
| Retry com backoff exponencial para MySQL | Não necessário no volume atual; Sequelize reconecta automaticamente |
| Circuit breaker para chamadas ao Stripe | Aguardando integração real do Stripe |
| Alertas automáticos (CPU/memória) | Observabilidade não implantada ainda |
| Dead letter queue para Pub/Sub | Redis Streams ou RabbitMQ para versão pós-MVP |
