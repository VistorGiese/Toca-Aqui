# Phase 6: Bug Fixes & UX — Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Source:** UAT manual realizado em 2026-04-03 após conclusão da Fase 5

<domain>
## Phase Boundary

Esta fase corrige todos os bugs encontrados durante o teste ponta-a-ponta do TCC e implementa features secundárias identificadas como faltando. O foco é garantir que o demo do TCC funcione sem crashes, 404s ou botões mortos, e que as telas de perfil/edição de todos os perfis estejam funcionais.

Não inclui: checkout/pagamento, notificações push, chat, funcionalidades de admin.

</domain>

<decisions>
## Implementation Decisions

### D-01: Logout Universal
- Todos os perfis (usuário comum, artista, estabelecimento) devem ter logout funcional
- O botão "Sair" deve chamar `AsyncStorage.removeItem('token')` (ou equivalente no AuthContext) e navegar para a tela `Login`
- Verificar se existe um AuthContext/hook de autenticação e usar o método correto de logout
- Os três perfis provavelmente têm o mesmo problema — investigar todos

### D-02: Bug v.toFixed is not a function
- Crash ocorre ao clicar em "vagas" dentro do perfil estabelecimento (provavelmente `EstNewGig` ou tela de listagem de vagas)
- `toFixed()` só funciona em `number` — o dado vindo do backend provavelmente é string
- Fix: usar `parseFloat(value).toFixed(2)` ou `Number(value).toFixed(2)` com fallback
- Investigar qual campo causa o crash (provavelmente `cache_min`, `valor_proposto` ou similar)

### D-03: Bug 404 na candidatura do artista
- Erro 404 ao tentar candidatar artista a uma vaga publicada pelo estabelecimento
- Investigar qual endpoint está sendo chamado vs o que existe no backend
- Verificar `bandApplicationService.ts` — as rotas foram corrigidas na Fase 1 mas pode ter regredido
- Também investigar o erro de "som próprio" — pode ser um campo obrigatório faltando no body

### D-04: Busca no perfil comum (UserSearch)
- O mecanismo de busca não faz nada atualmente
- Implementar chamada ao backend para buscar artistas e/ou eventos
- Se o endpoint de busca não existe no backend, criar um endpoint simples de busca
- UserFavorites depende da busca funcionar

### D-05: Busca no perfil estabelecimento — 404
- A busca retorna 404 — endpoint provavelmente incorreto
- Investigar qual endpoint a busca do estabelecimento usa e corrigir

### D-06: Agenda do estabelecimento (EstSchedule)
- Atualmente não lista nada
- Deve buscar e listar os eventos/shows criados pelo estabelecimento logado
- Provavelmente usa um endpoint de `GET /eventos` filtrado por `perfil_estabelecimento_id`
- Verificar o service correto a usar

### D-07: Tela de edição de perfil do estabelecimento (EstEditProfile)
- Não existe ainda
- Deve ser consistente visualmente com as telas de edição do usuário comum e artista
- Campos: nome do estabelecimento, endereço, descrição, foto de perfil, tipo de local
- Deve usar os mesmos componentes de UI (DS design tokens, Montserrat, cores roxas)
- Criar a tela e conectar na navegação do perfil do estabelecimento

### D-08: Edição de perfil do artista — telas antigas
- Atualmente ao clicar "editar perfil" no perfil artista, são abertas telas antigas/incorretas
- Identificar quais telas são abertas e quais deveriam ser
- As telas corretas devem seguir o padrão visual das telas de edição do usuário comum e estabelecimento
- Se as telas antigas existem mas estão desconectadas, removê-las da navegação
- A edição deve incluir: nome artístico, bio, gêneros musicais, instrumentos, valor de cachê base

### D-09: Consistência visual das telas de edição
- Telas de edição do artista devem ser visualmente consistentes com as do usuário comum e do estabelecimento
- Usar DS design tokens: DS.bg, DS.card, DS.accent (#7B61FF), DS.primary (#A78BFA), Montserrat
- Verificar como as telas de edição do usuário comum e estabelecimento estão implementadas e replicar o padrão

### Claude's Discretion
- Ordem de execução das correções (sugerido: bugs críticos primeiro, features por último)
- Estrutura dos planos (wave 1: bugs críticos; wave 2: features novas)
- Se endpoint de busca não existe no backend, criar um simples com filtro por nome

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Navegação e Auth
- `TocaAqui/navigation/Navigate.tsx` — Estrutura de navegação completa, onde cada perfil começa
- `TocaAqui/context/AuthContext.tsx` (se existir) — Context de autenticação e método de logout

### Services frontend
- `TocaAqui/http/bandApplicationService.ts` — Service de candidaturas (D-03)
- `TocaAqui/http/establishmentService.ts` — Service do estabelecimento (busca, agenda)
- `TocaAqui/http/userService.ts` — Service do usuário comum (busca)
- `TocaAqui/http/artistaPublicoService.ts` — Service do perfil público de artista

### Telas de perfil e edição
- `TocaAqui/screens/user/UserSettings.tsx` — Perfil do usuário comum (referência para logout)
- `TocaAqui/screens/artist/ArtistProfile.tsx` — Perfil do artista (logout + editar perfil)
- `TocaAqui/screens/establishment/EstProfile.tsx` — Perfil do estabelecimento (logout + editar)
- `TocaAqui/screens/establishment/EstSchedule.tsx` — Agenda do estabelecimento (D-06)
- `TocaAqui/screens/establishment/EstNewGig.tsx` — Criação de vagas (provável origem do v.toFixed)
- `TocaAqui/screens/user/UserSearch.tsx` — Busca do usuário comum (D-04)

### Design System
- `TocaAqui/constants/DesignSystem.ts` — DS tokens (cores, fontes, espaçamentos)

### Backend rotas
- `backend-TocaAqui/src/routes/` — Todas as rotas existentes
- `backend-TocaAqui/src/routes/BandApplicationRoutes.ts` — Rotas de candidatura (D-03)
- `backend-TocaAqui/src/routes/UserRoutes.ts` — Rotas de usuário (busca)

</canonical_refs>

<specifics>
## Specific Ideas

### Bugs reportados (UAT 2026-04-03):
1. `v.toFixed is not a function` ao clicar em vagas dentro do estabelecimento → tela preta
2. Erro 404 ao candidatar artista a vaga publicada pelo estabelecimento
3. Erro ao selecionar "som próprio" ao candidatar-se a uma vaga
4. Botão "Sair da conta" no perfil comum (UserSettings) não faz nada
5. Botão "Sair" no perfil artista não volta para o perfil comum (deveria ir para Login)
6. Ao clicar "editar perfil" no artista, são abertas telas antigas do app
7. Busca no perfil comum não faz nada
8. Busca no perfil do estabelecimento retorna 404
9. Agenda do estabelecimento não lista nada
10. Não existe tela de edição de perfil do estabelecimento
11. Tela de favoritos não pode ser testada (depende da busca)

### Referência visual para novas telas:
- Usar o mesmo padrão visual das telas existentes: fundo escuro (#0D0D0D ou DS.bg), cards com DS.card, accent roxo DS.accent (#7B61FF), fonte Montserrat
- Input fields com borda DS.accent quando focados
- Botão primário: backgroundColor DS.accent, borderRadius 12, Montserrat-Bold

</specifics>

<deferred>
## Deferred Ideas

- Favoritos (UserFavorites): pode ser implementada após a busca funcionar — depende de D-04
- Checkout/pagamento: fora do escopo do TCC
- Avaliação artista→estabelecimento: fora do escopo desta fase

</deferred>

---

*Phase: 06-bug-fixes-ux*
*Context gathered: 2026-04-03 via UAT manual*
