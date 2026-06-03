# Testes — Toca Aqui API

## Estrutura

```
src/__tests__/
  unit/
    auth/         → AuthService, JWT, middlewares de autenticação
    contracts/    → ContractController, ContractService
    applications/ → BandApplicationController, BandApplicationService
    notifications/→ NotificationController, NotificationService
    core/         → AppError, errorHandler, validate middleware
  integration/    → Testes integrados com SQLite in-memory (Supertest)
  helpers/
    factories.ts  → Factories de dados de teste (makeUserData, makeContractData, ...)
    apiHelpers.ts → Helpers HTTP (makeToken, authHeader, assertError, assertList)
    assertions.ts → Helpers de asserção (assertSuccessResponse, assertErrorResponse, ...)
```

## Executar

| Comando | O que faz |
|---------|-----------|
| `npm run test:unit` | Testes unitários (Jest, com mocks) |
| `npm run test:integration` | Testes integrados (Supertest + SQLite in-memory) |
| `npm run test:all` | Todos os testes |
| `npm run test:coverage` | Todos com relatório de cobertura |

## Critérios de Aceite por Módulo

### Contratos (integration)
- [x] Deve retornar 401 quando requisição não tem token
- [x] Deve retornar lista vazia quando usuário não tem contratos
- [x] Deve retornar contratos do artista autenticado
- [x] Deve retornar contratos do estabelecimento autenticado
- [x] Deve retornar contrato por ID para usuário contratante
- [x] Deve retornar contrato por ID para usuário contratado
- [x] Deve retornar 403 quando contrato não existe (segurança)
- [x] Deve retornar 403 quando usuário não faz parte do contrato
- [x] Deve aceitar contrato quando artista (contratado) confirma
- [x] Deve retornar 400 quando artista tenta aceitar contrato já aceito
- [x] Deve retornar 403 quando outsider tenta aceitar contrato
- [x] Deve cancelar contrato quando contratante solicita com motivo
- [x] Deve retornar 400 quando tenta cancelar contrato já cancelado
- [x] Deve retornar 403 quando outsider tenta cancelar contrato

### Auth (unit)
- [x] Deve gerar token JWT com roles[]
- [x] Deve rejeitar requisição sem token
- [x] Deve rejeitar token expirado
- [x] Deve verificar roles corretamente com array

### Candidaturas (unit)
- [x] Deve criar candidatura quando artista e vaga existem
- [x] Deve aceitar candidatura e recusar as demais do mesmo evento
- [x] Deve rejeitar candidatura de artista sem perfil

## Padrões

- Nomenclatura: `deve X quando Y` em todos os `it()`
- Estrutura: **AAA** (Arrange / Act / Assert) com comentários
- Factories: use `makeUserData()`, `makeContractData()`, etc. — nunca duplicar setup inline
- Mocks: mockar apenas dependências externas (DB, Redis, Email) — não mockar o que está sendo testado
