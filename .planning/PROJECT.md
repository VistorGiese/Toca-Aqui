# Toca Aqui

## What This Is

Marketplace mobile (React Native + Expo) que conecta **artistas/bandas** com **estabelecimentos** para contratação de shows ao vivo. Um estabelecimento cria um evento com cachê, artistas se candidatam propondo um valor, o estabelecimento aceita uma candidatura, um contrato é gerado e o artista confirma. As demais candidaturas são recusadas automaticamente. Usuários comuns (audiência) navegam e visualizam os eventos.

Projeto de TCC — o objetivo é demonstrar o fluxo completo e funcional na defesa.

## Core Value

O fluxo ponta-a-ponta de contratação de show: **evento → candidatura → aceite → contrato → bloqueio das demais candidaturas**. Tudo isso funcionando sem erros visíveis é o critério de sucesso do TCC.

## Who It's For

- **Artistas/Bandas** — encontram eventos abertos, se candidatam com um valor proposto
- **Estabelecimentos** — criam eventos, recebem candidaturas, escolhem um artista e fecham o contrato
- **Usuário comum** — navega e visualiza eventos e descrições dos shows

## The Problem

O codebase já existe mas tem bugs em múltiplas camadas: fluxo de candidatura, fluxo de contrato, telas que não navegam corretamente e dados que não aparecem. O fluxo central do marketplace não funciona de ponta a ponta.

## Key Flows

### Fluxo Principal (must work)
1. Estabelecimento cria evento com data, local, descrição e cachê base
2. Artista navega eventos disponíveis (`BrowseEvents`) e se candidata propondo um valor (`bandApplicationService`)
3. Estabelecimento vê candidaturas (`EstGigApplications`), escolhe uma e aceita
4. Sistema cria contrato (`ContractModel`) com status `aguardando_aceite` e recusa automaticamente as demais candidaturas
5. Artista vê o contrato (`ContractDetail`), confirma → status passa para `aceito`
6. Evento fica bloqueado — nenhuma outra banda pode aceitar

### Fluxo Secundário (should work)
- Usuário comum visualiza eventos e suas descrições (`UserFeed`, `UserShowDetail`)
- Perfis de artista mostram `shows_realizados` e `nota_media` reais (migration já aplicada)

### Fluxo Bônus (nice to have)
- Usuário comum compra ingresso (`UserCheckout`)
- Avaliação pós-show (`EstRateArtist`, `RateEstablishment`)

## Stack

- **Frontend:** React Native + Expo (TypeScript)
- **Backend:** Node.js + Express v5 + Sequelize + MySQL
- **Cache/Auth:** Redis (token blacklist, reset tokens)
- **Pagamentos:** Stripe (backend implementado, frontend pendente)

## What Already Works (Validated)

- Autenticação completa: registro, login, logout, reset de senha
- Sessão restaurada no cold start (corrigido)
- Onboarding de artista e estabelecimento
- Criação de eventos pelo estabelecimento
- Navegação por papel (artist/establishment/common_user)
- Error boundary na app (corrigido)
- `shows_realizados`/`nota_media` com migration aplicada
- HTTP layer centralizado — todos os services usam `api.ts` (Validado na Phase 1)
- `bandApplicationService` com rotas alinhadas ao backend e response handling correto (Validado na Phase 1)
- Navegação do fluxo artista com tipos corretos (`ArtistStackParamList`) (Validado na Phase 1)

## What Needs to Work (Active)

- [ ] Fluxo de candidatura ponta-a-ponta (aplicar + listar + status)
- [ ] Aceite de candidatura pelo estabelecimento com valor negociado
- [ ] Geração automática de contrato após aceite
- [ ] Recusa automática das demais candidaturas ao aceitar uma
- [ ] Confirmação do contrato pelo artista
- [ ] Visualização de evento pelo usuário comum (feed + detalhe)
- [ ] Dados reais nos perfis (nota_media, shows_realizados populados)

## Out of Scope (TCC)

- Pagamento via Stripe no frontend — backend existe, UI não será implementada
- Sistema de ingresso completo — visualização sim, compra é bônus
- Microserviço `social-service` — código morto, ignorado
- Notificações push reais — in-app apenas

## Key Decisions

| Decisão | Racional | Resultado |
|---|---|---|
| Artista e banda são o mesmo conceito | `perfis_artistas` é a entidade base para qualquer performer | Sem entidade separada `Banda` no fluxo de candidatura |
| Recusa automática ao aceitar | Garantia de exclusividade do slot | `BandApplicationService` recusa todas as outras ao aceitar uma |
| Artista confirma o contrato | Dupla confirmação cria senso de comprometimento | Contrato nasce como `aguardando_aceite`, artista muda para `aceito` |
| Valor negociado | Artista propõe na candidatura, estabelecimento aceita | Campo `valor_proposto` na `BandApplication` |

## Evolution

Este documento evolui a cada transição de fase e marco do milestone.

**Após cada fase** (`/gsd:transition`):
1. Requisitos invalidados? → Mover para Out of Scope com razão
2. Requisitos validados? → Mover para Validated com referência da fase
3. Novos requisitos? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions

**Após cada milestone** (`/gsd:complete-milestone`):
1. Revisão completa de todas as seções
2. Core Value ainda correto?
3. Audit de Out of Scope — razões ainda válidas?

---
*Last updated: 2026-04-01 após Phase 1 (Foundation) completa*
