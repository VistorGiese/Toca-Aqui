# ADR 001 — Arquitetura Backend: Monolito Modular

**Status:** Aceito
**Data:** 12/05/2026

---

## Contexto

O projeto **Toca Aqui** é um aplicativo mobile que conecta artistas e bandas a estabelecimentos para shows ao vivo. O backend precisava suportar operações centrais de negócio — cadastro de usuários, perfis, eventos, candidaturas, contratos e ingressos — além de funcionalidades com comportamento distinto, como notificações em tempo real, e-mail transacional e pagamentos.

Durante o planejamento inicial cogitou-se separar o domínio social (comentários, avaliações, favoritos) em um microsserviço independente. Após avaliação prática, a separação foi descartada: a equipe é pequena, o MVP exige velocidade de entrega e o acoplamento transacional entre os domínios tornaria o custo operacional de dois serviços injustificável neste estágio.

---

## Decisão

Adotar um **monolito modular** como única unidade de deploy do backend.

### Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Linguagem | TypeScript |
| ORM | Sequelize |
| Banco de dados | MySQL 8.0 |
| Cache / Pub-Sub | Redis 7 |
| Reverse proxy | Nginx 1.25 |
| E-mail | Nodemailer + Gmail SMTP |
| Pagamentos | Stripe *(planejado)* |

### Estrutura interna do monolito

O código é organizado por responsabilidade técnica, com separação clara entre camadas:

```
src/
  controllers/   — entrada HTTP, delegação para services
  services/      — regras de negócio
  models/        — entidades Sequelize + associações
  routes/        — registro de rotas Express
  middleware/    — auth, validação Zod, rate limiter, error handler
  schemas/       — schemas Zod por domínio
  config/        — database, redis, stripe, swagger, env
  utils/         — jwt, helpers
  __tests__/     — testes unitários Jest
```

### Comunicação em tempo real

Notificações em tempo real utilizam **Redis Pub/Sub** via `PubSubService`, desacoplando o disparo de notificações da camada HTTP sem necessidade de broker externo.

---

## Motivação

- Monolito reduz complexidade operacional e acelera entregas do core business no contexto de TCC.
- Separação em módulos internos preserva coesão por domínio e facilita extração futura de microsserviços.
- Redis Pub/Sub atende à necessidade de comunicação assíncrona sem adicionar dependência de Kafka ou RabbitMQ.
- Nginx como reverse proxy centraliza entry point, absorve TLS e permite rate limiting por IP.

---

## Consequências

### Positivas

- Um único serviço para manter, debugar e deployar.
- Transações de banco de dados consistentes sem two-phase commit.
- Infraestrutura simples: 4 containers Docker (app, mysql, redis, nginx).
- Redis já presente no stack pode ser reutilizado para cache e rate limiting.

### Negativas

- Escalabilidade horizontal do serviço inteiro, mesmo que apenas um domínio esteja sobrecarregado.
- Risco de acoplamento crescente à medida que o sistema evolui sem disciplina de módulos.
- Deploy de qualquer mudança reinicia a aplicação inteira.
