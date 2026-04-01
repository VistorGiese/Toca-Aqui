# Phase 2: Artist Application Flow - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Artista consegue navegar eventos abertos (status `pendente`), se candidatar informando um `valor_proposto`, e acompanhar o status das suas candidaturas em `MyApplications`. Esta fase cobre o ciclo completo da candidatura do ponto de vista do artista — sem a lógica de aceite (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### BrowseEvents — Display & Filtro
- Passar `{ status: 'pendente' }` como query param na chamada ao backend (`/agendamentos?status=pendente`) — filtro no servidor, não client-side
- Backend deve incluir `nome_estabelecimento` na resposta via JOIN com `EstablishmentProfileModel` — exibir nome real no card
- `EventDetailArtist` mantém fetch separado (busca avaliações, dados do estabelecimento) — não passar booking via params

### ApplyConfirmation — valor_proposto
- Campo `valor_proposto` é obrigatório — artista não pode submeter candidatura sem informar um valor
- Campo começa vazio — artista decide o próprio valor (sem pre-fill)
- Schema Zod no backend (`applyBandSchema`) deve ser atualizado para incluir `valor_proposto: z.number().positive()` (obrigatório)
- Controller `applyBandToEvent` deve ler e repassar `valor_proposto` ao service
- `BandApplicationService.apply()` deve salvar `valor_proposto` no model

### MyApplications — Refresh & UX
- Adicionar `useFocusEffect` para re-fetch automático ao voltar à tela — atende success criteria "atualiza ao voltar para a tela"
- Estrutura do card preparada para botão "Ver contrato", mas implementação do botão fica para Phase 3
- Status string `"recusado"` já alinhado com backend (Phase 1 corrigiu "rejeitado" → "recusado")

### Claude's Discretion
- Formatação do input de valor (moeda vs número puro) — usar formato numérico simples com placeholder "Ex: 350"
- Onde exibir `valor_proposto` submetido em `MyApplications` — mostrar no card de candidatura se disponível

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bandApplicationService` — já tem `applyToEvent`, `getMyApplications`, `acceptApplication`, `rejectApplication` (Phase 1 adicionou stubs)
- `bookingService.getBookings()` — chama `/agendamentos`, retorna `response.data.data ?? []` — funciona mas sem filtro de status
- `eventService.getAvailableEvents(params)` — existe em `TocaAqui/http/eventService.ts`, aceita `params.status` — usar este em vez de `bookingService`
- `BrowseEvents.tsx` — já tem lógica de filtro client-side `b.status === "pendente"`, tabs de semana/fim-de-semana, RefreshControl, tela de loading
- `MyApplications.tsx` — já usa `bandApplicationService.getMyApplications()`, já tem tabs (Em análise / Aceitas / Recusadas), já tem ActivityIndicator
- `ApplyConfirmation.tsx` — já tem UI de mensagem, já faz `bandApplicationService.applyToEvent`, falta campo `valor_proposto`
- Design system `DS` — consistente em todos os arquivos artist (bg, accent, textSec, etc.)

### Established Patterns
- Screens de listagem: `useCallback` com `isRefresh` param + `useFocusEffect` para re-fetch → ver `ArtistSchedule.tsx` como referência de `useFocusEffect`
- Loading state: `ActivityIndicator` com `size="large" color={DS.accent}` em container centralizado
- Alert de erro: `Alert.alert("Erro", "mensagem")` no catch
- Navegação: `NativeStackNavigationProp<ArtistStackParamList>` em todas as telas de artista
- HTTP: services em `TocaAqui/http/`, todos importam `api` de `./api`

### Integration Points
- `BandApplicationModel` no backend tem coluna `valor_proposto` (tipo DECIMAL) — precisa verificar se já existe ou se é necessário migration
- `applyBandSchema` em `backend-TocaAqui/src/schemas/bandApplicationSchemas.ts` — adicionar `valor_proposto`
- `BandApplicationController.applyBandToEvent` — ler `valor_proposto` do body
- `BandApplicationService.apply()` em `backend-TocaAqui/src/services/BandApplicationService.ts` — salvar `valor_proposto`
- `BookingController.getBookings` — adicionar JOIN com `EstablishmentProfileModel` para incluir `nome_estabelecimento`

</code_context>

<specifics>
## Specific Ideas

- Card de candidatura em `MyApplications` deve exibir `valor_proposto` quando disponível (ex: "Valor proposto: R$ 350,00")
- BrowseEvents card: substituir `Estab. #${id}` por `nome_estabelecimento` quando disponível no response
- Input de `valor_proposto` em `ApplyConfirmation`: tipo numérico, placeholder "Ex: 350", label "Valor proposto (R$)"

</specifics>

<deferred>
## Deferred Ideas

- Botão "Ver contrato" em candidaturas aceitas em `MyApplications` → Phase 3 (03-03: contract-detail-confirm)
- Loading skeleton em cards de BrowseEvents → Phase 5 (05-03: loading-states)
- Validação de range (cache_minimo ≤ valor_proposto ≤ cache_maximo) → out of scope para o TCC

</deferred>
