# Phase 4: User Feed - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Usuário comum navega feed de eventos reais (`UserFeed`) e visualiza detalhe de qualquer evento (`UserShowDetail`) com dados completos. As telas já existem e têm estrutura sólida — o trabalho é corrigir comportamentos incorretos, adicionar o filtro "Hoje" com suporte backend, e exibir o artista confirmado condicionalmente (somente quando há contrato aceito).

</domain>

<decisions>
## Implementation Decisions

### Filtro "Hoje"
- Adicionar param `esta_hoje=true` no backend `ShowService.getPublicShows()` e expô-lo via `ShowRoutes`
- Frontend envia `params.esta_hoje = true` quando filtro ativo é "Hoje"
- Empty state quando sem shows hoje: "Nenhum show hoje"

### Seção "O Artista" em UserShowDetail
- Sempre exibir a seção "O Artista" — mas condicionalmente: quando `show.Contract?.Band` existe, mostrar nome e gêneros; quando não existe, mostrar "Artista a ser confirmado"
- `artistId` fallback a `1` é problemático — desabilitar/ocultar navegação ao perfil quando `!show.Contract?.Band?.id`
- Não usar `titulo_evento` como fallback para nome do artista — é semanticamente errado

### Comportamento do UserFeed
- `titulo_evento` é o título principal do card — não `nome_banda` (o título do evento é o que o estabelecimento nomeou)
- Remover o botão "VER TODOS" que não tem `onPress` — sem funcionalidade real para o TCC
- Manter `useEffect` atual — o feed é a tela de entrada do navigator, recarrega ao montar

### Claude's Discretion
- Formatação de datas: manter `formatShowDate` UTC existente (consistente entre UserFeed e UserShowDetail)
- Error handling: `Alert.alert("Erro", msg)` no catch — padrão existente
- Loading states: `ActivityIndicator color="#A78BFA"` — padrão existente

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getGenreColor(genero_musical)` em `@/utils/colors` — já usado em ambas as telas
- `FontAwesome5` do `@expo/vector-icons` — ícones padronizados
- `showService.ts` — `getPublicShows(params)`, `getShowsDestaque()`, `getShowById(id)` — endpoints corretos
- `UserStackParamList` em `UserNavigator.tsx` — `UserShowDetail: { showId: number }` já tipado

### Established Patterns
- `useCallback + useEffect` para fetch com deps imutáveis
- `StyleSheet.create` com dark theme `#09090F` background
- `ActivityIndicator size="large" color="#A78BFA"` durante loading
- `Alert.alert("Erro", ...)` no catch — padrão universal no app

### Integration Points
- Backend: `GET /shows?esta_semana=true&fim_de_semana=true&esta_hoje=true` — `ShowRoutes` já registrado em `index.ts`
- `ShowService.getPublicShows` no backend precisa receber e filtrar `esta_hoje`
- `UserFeed` navega para `UserShowDetail` com `{ showId: show.id }` ✓
- `UserShowDetail` recebe `{ showId }` via `route.params` ✓
- `show.Contract?.Band` incluso na resposta backend (ContractModel → BandModel com `status: 'aceito'`) ✓

</code_context>

<specifics>
## Specific Ideas

- Filtro "Hoje" deve adicionar `esta_hoje=true` no backend (não só client-side) — decisão explícita do usuário
- Seção artista: exibir "Artista a ser confirmado" quando `!show.Contract?.Band` — nunca usar `titulo_evento` como nome de artista

</specifics>

<deferred>
## Deferred Ideas

- Botão "VER TODOS" com funcionalidade real (listagem filtrada) — fora do escopo TCC
- `useFocusEffect` para recarregar feed ao voltar do detalhe — `useEffect` é suficiente
- Favoritos com persistência real — coração existe na UI mas sem backend
- Integração de mapa/directions no card de local — botão "Como chegar" sem action é aceitável

</deferred>
