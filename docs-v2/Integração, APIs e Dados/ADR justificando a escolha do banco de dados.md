# ADR — Integração, APIs e Dados: Escolhas de Persistência e Comunicação

**Status:** Aceito
**Data:** 12/05/2026

---

## 1. Banco de Dados Principal: MySQL 8.0

### Contexto

O domínio do Toca Aqui é fortemente relacional: usuários possuem perfis; perfis criam eventos; artistas se candidatam; candidaturas geram contratos; contratos têm histórico e pagamentos. Esse grafo de relacionamentos exige banco com suporte robusto a foreign keys, cascades e transações ACID.

### Decisão

**MySQL 8.0** via Sequelize ORM, rodando em container Docker com volume persistente.

### Modelo de dados (principais relacionamentos)

```
Usuario
  ├── PerfilArtista (1:N)
  │     ├── BandMember (N:M via BandMemberModel)
  │     ├── BandApplication (1:N)
  │     ├── Contrato (1:N)
  │     └── SeguidorArtista (1:N)
  ├── PerfilEstabelecimento (1:N)
  │     ├── Agendamento/Booking (1:N)
  │     │     ├── BandApplication (1:N)
  │     │     ├── Contrato (1:1)
  │     │     ├── Ingresso (1:N)
  │     │     ├── AvaliacaoShow (1:N)
  │     │     └── ComentarioShow (1:N)
  │     └── EstablishmentMember (1:N)
  ├── Favorito (1:N)
  ├── Notificacao (1:N)
  ├── Ingresso (1:N)
  └── PreferenciaUsuario (1:1)

Banda
  ├── BandMember (1:N)
  ├── BandApplication (1:N)
  └── Contrato (1:N)

Contrato
  ├── ContractHistory (1:N)
  └── Payment (1:N) [planejado]
```

### Por que não PostgreSQL

A documentação inicial do projeto listava PostgreSQL como banco. Durante o desenvolvimento optou-se por MySQL pela familiaridade da equipe e suporte nativo no Sequelize sem diferenças práticas para o volume de dados esperado no MVP.

---

## 2. Cache e Pub/Sub: Redis 7

### Contexto

O sistema precisa de rate limiting por IP para proteger endpoints de autenticação, e de um mecanismo de comunicação assíncrona para notificações em tempo real sem bloquear o fluxo HTTP.

### Decisão

**Redis 7-alpine** para duas responsabilidades:

| Responsabilidade | Mecanismo Redis | Implementação |
|---|---|---|
| Rate limiting | Contadores com TTL | `rateLimiter` middleware |
| Notificações assíncronas | Pub/Sub channels | `PubSubService` |

### Por que não Kafka ou RabbitMQ

O volume de mensagens no MVP não justifica a complexidade operacional de um broker dedicado. Redis já está no stack e seu Pub/Sub atende aos requisitos atuais. A troca para Redis Streams ou RabbitMQ pode ser feita substituindo apenas o `PubSubService`.

---

## 3. E-mail Transacional: Gmail SMTP (Nodemailer)

### Contexto

O sistema precisa enviar e-mails em eventos como: confirmação de cadastro, notificação de candidatura, geração de contrato.

### Decisão

**Nodemailer** com **Gmail SMTP** (`smtp.gmail.com:587`, TLS) via conta de serviço configurada por variáveis de ambiente (`SMTP_USER`, `SMTP_PASS`).

Implementado em `EmailService.ts`, injetável nos services que necessitem de envio.

### Limitações conhecidas

- Gmail SMTP tem limite de envio diário (~500 e-mails/dia em conta gratuita).
- Para produção em escala, migração para SendGrid, Amazon SES ou similar seria necessária.

---

## 4. Gateway de Pagamentos: Stripe *(planejado)*

### Contexto

A monetização do Toca Aqui inclui venda de ingressos para usuários comuns e assinaturas mensais para artistas (plano freemium: até 3 candidaturas/mês gratuito; plano premium: R$ 29-39/mês).

### Decisão

**Stripe** como gateway de pagamento, com integração via `StripeService` e confirmação via webhooks.

### Status atual

A integração está **mockada**. `StripeService`, `PaymentService` e `PaymentModel` existem no código mas não processam transações reais. A integração completa está planejada para versão pós-MVP.

---

## 5. API REST: Padrões de Integração

### Autenticação

Todas as rotas protegidas exigem header `Authorization: Bearer <JWT>`. O token é validado pelo `authMiddleware` antes de atingir o controller.

| Token | Expiração configurável |
|---|---|
| Access Token | `JWT_EXPIRES_IN` (padrão: 7d) |
| Refresh Token | `JWT_REFRESH_EXPIRES_IN` (padrão: 30d) |

### Validação de entrada

Todos os endpoints com body usam **schemas Zod** validados pelo middleware `validate`, garantindo tipagem segura antes de atingir a camada de serviço.

### Endpoints principais por domínio

| Domínio | Prefixo | Exemplos |
|---|---|---|
| Usuários | `/usuarios` | POST /registro, POST /login, GET /perfil, GET /minhas-paginas |
| Artistas | `/artistas` | GET /:id/publico |
| Perfis artistas | `/perfis-artista` | GET /busca |
| Estabelecimentos | `/estabelecimentos` | GET /:id |
| Agendamentos | `/agendamentos` | GET, POST |
| Eventos/candidaturas | `/eventos` | POST, GET /minhas, GET /:id, PUT /:id/aceitar, PUT /:id/recusar |
| Contratos | `/contratos` | GET /meus, GET /:id, PUT /:id/aceitar, PUT /:id/cancelar |
| Notificações | `/notificacoes` | GET, PATCH /:id/lida, PATCH /todas/lida |
| Ingressos | `/ingressos` | GET, POST |
| Favoritos | `/favoritos` | GET, POST, DELETE |
| Social | `/avaliacoes`, `/comentarios` | CRUD por show |
