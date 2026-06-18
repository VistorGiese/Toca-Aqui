# Pirâmide de Testes

Visão geral dos tipos de teste do backend e onde cada um vive, com foco no
fluxo de negócio central do TCC — **estabelecimento cria evento → artista se
candidata → estabelecimento aceita (gera contrato)** — incluindo o lock
distribuído introduzido em `BandApplicationService.accept()`
(ver [`CONCURRENCY.md`](./CONCURRENCY.md)).

```
            ▲
           /load\          k6 — fluxo completo sob carga + contenção do lock
          /------\
         /behavior\        jest-cucumber — cenários Gherkin (BDD)
        /----------\
       /    e2e     \      supertest + SQLite in-memory — HTTP → DB real
      /--------------\
     /  integration   \    supertest — CRUD de Contratos
    /------------------\
   /        unit         \  Jest — services, controllers, middlewares, schemas
  /------------------------\
```

## Unitário (`src/__tests__/unit/**`)

- **O que cobre:** regras de negócio isoladas (services, controllers,
  middlewares, schemas Zod), com dependências (models, Redis, email)
  mockadas.
- **Rodar:** `npm run test:unit`

## Integração (`src/__tests__/integration/`)

- **O que cobre:** CRUD de Contratos via HTTP (supertest) contra SQLite
  in-memory, com Redis/email/notificação mockados.
- **Rodar:** `npm run test:integration`

## E2E (`src/__tests__/e2e/`)

- **Arquivo:** `band-application-flow.e2e.test.ts`
- **O que cobre:** o fluxo completo via HTTP — `POST /agendamentos` (criar
  evento) → `POST /eventos` (artista se candidata) → `PUT /eventos/:id/aceitar`
  (estabelecimento aceita, gera contrato) → `GET /contratos/meus` — passando
  por Controllers → Services → Sequelize → SQLite in-memory.
- **Lock distribuído:** o Redis é substituído por um fake client em memória
  (`src/__tests__/helpers/fakeRedis.ts`) que implementa `getClient().set/eval`,
  permitindo que o `LockService` funcione de verdade (sem cair no fail-open).
  Um cenário dedicado dispara duas aceitações concorrentes para candidaturas
  do mesmo evento e valida que exatamente uma recebe `200` (com contrato) e a
  outra `409` ("Outra candidatura está sendo processada").
- Também cobre autorização: artista não pode aceitar a própria candidatura, e
  um estabelecimento não pode aceitar candidaturas de eventos de outro
  estabelecimento (`403`).
- **Rodar:** `npm run test:e2e`

## Comportamento / BDD (`src/__tests__/behavior/`)

- **Arquivos:** `features/candidatura-evento.feature` (Gherkin em português) +
  `candidatura-evento.steps.ts` (jest-cucumber).
- **O que cobre:** os mesmos 3 cenários do E2E, descritos em linguagem de
  negócio (Dado/Quando/Então) — fluxo feliz com geração de contrato,
  autorização ("Acesso negado" ao tentar aceitar candidatura de evento de
  outro estabelecimento) e a corrida pelo lock entre duas candidaturas
  concorrentes ao mesmo evento.
- Reaproveita a mesma infraestrutura do E2E (`buildE2EApp`, `fakeRedis`,
  mocks de notificação/email).
- **Rodar:** `npm run test:behavior`

## Carga (`load-tests/`, k6)

- **O que cobre:** o fluxo completo (`flow-throughput.js`) e a contenção do
  lock distribuído sob carga real (`lock-contention.js`), contra a stack
  `docker-compose` (app + MySQL + Redis reais).
- Requer Docker. Ver [`../load-tests/README.md`](../load-tests/README.md)
  para pré-requisitos e instruções.
- **Rodar:** `npm run load:seed` → `npm run load:flow` / `npm run load:lock`

## Rodando tudo

```bash
npm run test:all       # unit + integration + e2e + behavior
npm run test:coverage  # com relatório de cobertura
```
