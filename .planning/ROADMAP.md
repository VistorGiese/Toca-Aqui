# Roadmap: Toca Aqui v1.0

## Overview

O codebase já existe mas está quebrado em múltiplas camadas. O caminho para a defesa do TCC é: corrigir a fundação primeiro (rotas, navegação, dados), depois garantir que cada fluxo de persona funcione de ponta a ponta — artista candidatando, estabelecimento aceitando, contrato gerado, usuário comum navegando o feed. Cinco fases, entrega incremental, cada fase verificável de forma independente.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Corrigir bugs críticos de rota, navegação e IP hardcoded que bloqueiam todos os outros fluxos (completed 2026-04-01)
- [x] **Phase 2: Artist Application Flow** - Artista navega eventos, se candidata com valor proposto, visualiza status das candidaturas (completed 2026-04-02)
- [ ] **Phase 3: Accept & Contract Flow** - Estabelecimento aceita candidatura, sistema recusa as demais, contrato gerado, artista confirma
- [ ] **Phase 4: User Feed** - Usuário comum navega feed de eventos e visualiza detalhe com artista confirmado
- [x] **Phase 5: Integration Polish** - Dados reais em perfis, smoke test ponta-a-ponta, onPress handlers faltantes, loading states (completed 2026-04-03)
- [ ] **Phase 6: Bug Fixes & UX** - Corrigir bugs encontrados no UAT (v.toFixed, 404 candidatura, logout, busca), implementar telas faltando (editar perfil estab), ajustar edição perfil artista

## Phase Details

### Phase 1: Foundation
**Goal**: App conecta ao backend correto em qualquer máquina, rotas de candidatura retornam dados, e a navegação do fluxo principal não crasha
**Depends on**: Nothing (first phase)
**Requirements**: REQ-01, REQ-02, REQ-03
**Success Criteria** (what must be TRUE):
  1. App abre em qualquer máquina sem precisar editar código — IP/URL do backend vem de variável de ambiente ou constante centralizada
  2. `bandApplicationService` chama as mesmas rotas registradas em `BandApplicationRoutes.ts` — nenhuma chamada retorna 404
  3. Navegar de BrowseEvents → ApplyConfirmation → MyApplications → ContractDetail não produz erros de parâmetro faltando
  4. Telas de listagem (candidaturas, contratos, agenda) exibem dados do banco em vez de listas vazias causadas por erros de rota
**Plans**: 3 plans

Plans:
- [ ] 01-01: fix-base-url — Centralizar baseURL em `constants/api.ts`, remover IPs hardcoded de todos os services
- [ ] 01-02: fix-band-application-routes — Auditar e alinhar todos os paths de `bandApplicationService.ts` com `BandApplicationRoutes.ts`
- [ ] 01-03: fix-navigation-params — Corrigir parâmetros faltando na navegação entre telas do fluxo principal (ApplyConfirmation, ContractDetail, ShowDetail)

### Phase 2: Artist Application Flow
**Goal**: Artista consegue navegar eventos abertos, se candidatar informando um valor, e acompanhar o status das suas candidaturas
**Depends on**: Phase 1
**Requirements**: REQ-04, REQ-05, REQ-06
**Success Criteria** (what must be TRUE):
  1. `BrowseEvents` exibe apenas eventos com status `pendente` — eventos fechados ou já contratados não aparecem
  2. Artista consegue abrir um evento, preencher `valor_proposto` e submeter a candidatura sem erro
  3. `MyApplications` lista as candidaturas do artista com o status atual (pendente / aceito / recusado) buscado do backend
  4. Status em `MyApplications` atualiza ao voltar para a tela após mudança no backend
**Plans**: 3 plans

Plans:
- [ ] 02-01: browse-events-filter — Garantir que BrowseEvents filtra por status `pendente` e exibe dados reais com loading state
- [ ] 02-02: apply-to-gig — Implementar/corrigir fluxo de candidatura com `valor_proposto` em ApplyConfirmation, conectado ao backend
- [ ] 02-03: my-applications-status — Corrigir MyApplications para buscar e exibir candidaturas reais com status correto

### Phase 3: Accept & Contract Flow
**Goal**: Estabelecimento vê candidaturas com valores propostos, aceita uma, sistema recusa as demais automaticamente, contrato é gerado e artista pode confirmar
**Depends on**: Phase 2
**Requirements**: REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14
**Success Criteria** (what must be TRUE):
  1. `EstGigApplications` exibe todas as candidaturas de um evento com nome do artista e `valor_proposto`
  2. Estabelecimento aceita uma candidatura — backend cria contrato com status `aguardando_aceite` e recusa todas as outras candidaturas do mesmo evento
  3. Artistas recusados veem status `recusado` em MyApplications após o aceite
  4. Artista aceito vê o contrato em ContractDetail e consegue confirmar — status muda para `aceito`
  5. `EstShowDetail` exibe o show confirmado com dados do artista após o artista assinar o contrato
**Plans**: 4 plans

Plans:
- [x] 03-01: est-gig-applications — Corrigir EstGigApplications para listar candidaturas com valor_proposto e conectar botão de aceitar
- [x] 03-02: accept-reject-logic — Validar/corrigir BandApplicationService e ContractService: aceitar uma candidatura, rejeitar demais, criar contrato (com transaction)
- [x] 03-03: contract-detail-confirm — Corrigir ContractDetail no app do artista: buscar contrato, exibir dados, implementar botão de confirmação conectado ao backend
- [x] 03-04: est-show-detail — Corrigir EstShowDetail para exibir show confirmado e notificação/feedback para artista aceito/recusado (REQ-07)
**UI hint**: yes

### Phase 4: User Feed
**Goal**: Usuário comum navega feed de eventos reais e visualiza detalhe de qualquer evento com informações completas
**Depends on**: Phase 1
**Requirements**: REQ-15, REQ-16
**Success Criteria** (what must be TRUE):
  1. Feed do usuário comum exibe eventos reais do banco com data, local e nome do show
  2. Usuário abre detalhe de um evento e vê descrição, data, local e artista confirmado (quando houver)
  3. Navegação Feed → EventDetail → volta ao Feed funciona sem crashes
**Plans**: 2 plans

Plans:
- [ ] 04-01: user-feed — Corrigir UserFeed para buscar eventos reais com loading state e exibir dados corretos
- [x] 04-02: user-show-detail — Corrigir UserShowDetail para exibir todos os campos do evento e artista confirmado (se contrato aceito)
**UI hint**: yes

### Phase 5: Integration Polish
**Goal**: Fluxo ponta-a-ponta funciona sem erros visíveis: perfis mostram dados reais, botões sem handler são corrigidos ou removidos, loading states aparecem durante carregamento
**Depends on**: Phase 3, Phase 4
**Requirements**: REQ-17
**Success Criteria** (what must be TRUE):
  1. Perfil de artista exibe `shows_realizados` e `nota_media` com valores reais após shows concluídos (ContractService incrementa ao marcar `concluido`)
  2. Nenhum botão relevante ao fluxo do TCC tem `onPress={() => {}}` vazio — todos fazem algo ou foram removidos
  3. Todas as telas do fluxo principal exibem ActivityIndicator durante carregamento — sem telas em branco
  4. Demo ponta-a-ponta completa: criar evento → candidatar → aceitar → contrato → confirmar → feed funciona sem erros visíveis
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Rota PUT /contratos/:id/concluir + botão "Marcar como Realizado" em EstShowDetail
- [x] 05-02-PLAN.md — Rota POST /contratos/:id/avaliar-artista + fix establishmentService.rateArtist endpoint
- [x] 05-03-PLAN.md — Standardizar ActivityIndicator color, auditar onPress handlers, verificação ponta-a-ponta
**UI hint**: yes

### Phase 6: Bug Fixes & UX
**Goal**: Corrigir todos os bugs encontrados no UAT de 2026-04-03 e implementar features faltando identificadas durante o teste ponta-a-ponta do TCC
**Depends on**: Phase 5
**Requirements**: REQ-20, REQ-21, REQ-22, REQ-23, REQ-24, REQ-25, REQ-26, REQ-27
**Success Criteria** (what must be TRUE):
  1. Logout funciona em todos os 3 perfis (usuário, artista, estabelecimento) e navega para Login
  2. Abrir lista de vagas no estabelecimento não crasha com `v.toFixed is not a function`
  3. Artista consegue se candidatar a uma vaga sem erro 404 e "som próprio" funciona
  4. Busca no perfil comum retorna artistas/eventos do backend
  5. Agenda do estabelecimento lista os eventos criados pelo estabelecimento
  6. Tela de edição de perfil do estabelecimento existe e salva dados
  7. Edição de perfil artista navega para telas corretas (não telas antigas)
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md — Bugs críticos: v.toFixed crash em EstGigs, 404 candidatura (POST /candidaturas→/eventos), logout em ArtistEPK e EstSettings
- [x] 06-02-PLAN.md — Busca funcional: UserSearch parsing robusto, EstSearch endpoint /artistas/busca
- [ ] 06-03-PLAN.md — Agenda EstSchedule com mapeamento defensivo de campos, ArtistProfileEdit reescrita para editar perfil artista real
- [ ] 06-04-PLAN.md — Nova tela EstEditProfile: edição de perfil do estabelecimento com campos nome, descrição, tipo, telefone
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in dependency order: 1 → 2 → 3 → 4 → 5 → 6
(Phases 2 and 4 can run in parallel once Phase 1 is complete)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete   | 2026-04-01 |
| 2. Artist Application Flow | 1/3 | Complete    | 2026-04-02 |
| 3. Accept & Contract Flow | 3/4 | In Progress|  |
| 4. User Feed | 1/2 | In Progress|  |
| 5. Integration Polish | 3/3 | Complete   | 2026-04-03 |
| 6. Bug Fixes & UX | 2/4 | In Progress|  |
