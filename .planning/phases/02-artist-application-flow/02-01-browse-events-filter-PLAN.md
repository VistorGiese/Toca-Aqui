---
phase: 02-artist-application-flow
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend-TocaAqui/src/controllers/BookingController.ts
  - TocaAqui/http/bookingService.ts
  - TocaAqui/screens/artist/BrowseEvents.tsx
autonomous: true
requirements: [REQ-04]

must_haves:
  truths:
    - "BrowseEvents exibe apenas eventos com status pendente filtrados no servidor"
    - "Cards de evento mostram nome_estabelecimento real em vez de Estab. #ID"
    - "Loading state aparece enquanto eventos carregam"
  artifacts:
    - path: "backend-TocaAqui/src/controllers/BookingController.ts"
      provides: "JOIN com EstablishmentProfileModel em getBookings"
      contains: "EstablishmentProfile"
    - path: "TocaAqui/http/bookingService.ts"
      provides: "getBookings aceita params opcionais"
      contains: "params?: { status?: string }"
    - path: "TocaAqui/screens/artist/BrowseEvents.tsx"
      provides: "Chamada com status pendente e exibicao de nome_estabelecimento"
      contains: "status: 'pendente'"
  key_links:
    - from: "TocaAqui/screens/artist/BrowseEvents.tsx"
      to: "TocaAqui/http/bookingService.ts"
      via: "bookingService.getBookings({ status: 'pendente' })"
      pattern: "getBookings.*status.*pendente"
    - from: "backend-TocaAqui/src/controllers/BookingController.ts"
      to: "EstablishmentProfileModel"
      via: "include JOIN in findAndCountAll"
      pattern: "include.*EstablishmentProfile"
---

<objective>
Garantir que BrowseEvents filtra por status `pendente` no servidor e exibe `nome_estabelecimento` real nos cards.

Purpose: REQ-04 — Artista pode navegar eventos disponiveis e ver apenas eventos com status aberto (pendente). Atualmente o filtro e client-side e o nome do estabelecimento nao aparece nos cards.
Output: Backend retorna eventos filtrados com nome do estabelecimento via JOIN; frontend exibe dados reais.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-artist-application-flow/02-CONTEXT.md
@.planning/phases/02-artist-application-flow/02-RESEARCH.md

<interfaces>
<!-- Key types and contracts the executor needs. -->

From TocaAqui/http/bookingService.ts:
```typescript
export interface Booking {
  id: number;
  banda_id: number | null;
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  estabelecimento_id: number;
  perfil_estabelecimento_id?: number;
  horario_inicio: string;
  horario_fim: string;
  status: BookingStatus;
  preco_ingresso_inteira?: number;
  banda?: { nome_banda: string };
}

interface BookingsResponse {
  data: Booking[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const getBookings = async () => {
  const response = await api.get<BookingsResponse>("/agendamentos");
  return response.data.data ?? [];
};
```

From backend-TocaAqui/src/controllers/BookingController.ts (getBookings, lines 104-109):
```typescript
const { count, rows } = await BookingModel.findAndCountAll({
  where,
  order: [['data_show', 'DESC']],
  limit,
  offset,
});
```

Existing association (from associations.ts):
```typescript
BookingModel.belongsTo(EstablishmentProfileModel, {
  foreignKey: 'perfil_estabelecimento_id',
  as: 'EstablishmentProfile',
});
```

EstablishmentProfileModel is already imported in BookingController.ts (line 5).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add EstablishmentProfile JOIN to BookingController.getBookings and map nome_estabelecimento</name>
  <files>backend-TocaAqui/src/controllers/BookingController.ts</files>
  <read_first>
    - backend-TocaAqui/src/controllers/BookingController.ts
    - backend-TocaAqui/src/models/associations.ts
    - backend-TocaAqui/src/models/EstablishmentProfileModel.ts
  </read_first>
  <action>
In `getBookings` function (line 104), add `include` to `BookingModel.findAndCountAll`:

```typescript
const { count, rows } = await BookingModel.findAndCountAll({
  where,
  include: [{
    model: EstablishmentProfileModel,
    as: 'EstablishmentProfile',
    attributes: ['id', 'nome_estabelecimento'],
  }],
  order: [['data_show', 'DESC']],
  limit,
  offset,
});
```

Then map the rows before building the payload to flatten `nome_estabelecimento` to the top level. Replace the `payload` construction (lines 111-119) with:

```typescript
const mappedRows = rows.map((row: any) => ({
  ...row.toJSON(),
  nome_estabelecimento: row.EstablishmentProfile?.nome_estabelecimento ?? null,
}));

const payload = {
  data: mappedRows,
  pagination: {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  },
};
```

`EstablishmentProfileModel` is already imported on line 5 — no new import needed.
  </action>
  <verify>
    <automated>cd backend-TocaAqui && npx ts-node -e "import('./src/controllers/BookingController').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"</automated>
  </verify>
  <acceptance_criteria>
    - BookingController.ts contains `include: [{ model: EstablishmentProfileModel, as: 'EstablishmentProfile'`
    - BookingController.ts contains `nome_estabelecimento: row.EstablishmentProfile?.nome_estabelecimento`
    - BookingController.ts contains `mappedRows` in the payload construction
  </acceptance_criteria>
  <done>getBookings returns nome_estabelecimento at top level of each booking object</done>
</task>

<task type="auto">
  <name>Task 2: Update bookingService.getBookings to accept params, update BrowseEvents to use server-side filter and display nome_estabelecimento</name>
  <files>TocaAqui/http/bookingService.ts, TocaAqui/screens/artist/BrowseEvents.tsx</files>
  <read_first>
    - TocaAqui/http/bookingService.ts
    - TocaAqui/screens/artist/BrowseEvents.tsx
  </read_first>
  <action>
**bookingService.ts:**

1. Add `nome_estabelecimento?: string` to the `Booking` interface:
```typescript
export interface Booking {
  id: number;
  banda_id: number | null;
  titulo_evento: string;
  descricao_evento?: string;
  data_show: string;
  estabelecimento_id: number;
  perfil_estabelecimento_id?: number;
  horario_inicio: string;
  horario_fim: string;
  status: BookingStatus;
  preco_ingresso_inteira?: number;
  nome_estabelecimento?: string;
  banda?: { nome_banda: string };
}
```

2. Update `getBookings` to accept optional params:
```typescript
const getBookings = async (params?: { status?: string }) => {
  const response = await api.get<BookingsResponse>("/agendamentos", { params });
  return response.data.data ?? [];
};
```

**BrowseEvents.tsx:**

1. In the `fetchBookings` function (or equivalent fetch callback), change the call from `bookingService.getBookings()` to:
```typescript
const data = await bookingService.getBookings({ status: 'pendente' });
```

2. Remove any client-side filter that does `b.status === "pendente"` or similar — the server now handles this. Set the bookings state directly with the returned data.

3. In the card rendering, replace the text that shows `Estab. #${booking.estabelecimento_id}` (or similar placeholder) with:
```typescript
booking.nome_estabelecimento ?? "Local nao informado"
```

Search for any occurrence of `estabelecimento_id` in the display text and replace with `nome_estabelecimento`.
  </action>
  <verify>
    <automated>cd TocaAqui && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <acceptance_criteria>
    - bookingService.ts contains `nome_estabelecimento?: string` inside the Booking interface
    - bookingService.ts contains `params?: { status?: string }` in getBookings signature
    - bookingService.ts contains `{ params }` in the api.get call
    - BrowseEvents.tsx contains `getBookings({ status: 'pendente' })`
    - BrowseEvents.tsx contains `nome_estabelecimento` (for card display)
    - BrowseEvents.tsx does NOT contain a client-side filter like `.filter(b => b.status === "pendente")`
  </acceptance_criteria>
  <done>BrowseEvents calls server with status=pendente filter and shows real establishment name in cards</done>
</task>

</tasks>

<verification>
- Backend: `GET /agendamentos?status=pendente` returns only pendente events with `nome_estabelecimento` field populated
- Frontend: BrowseEvents screen loads events from server with pendente filter, cards show real establishment name
- No client-side status filtering remains in BrowseEvents
</verification>

<success_criteria>
- BrowseEvents displays only pendente events filtered server-side
- Each event card shows the real establishment name (not "Estab. #ID")
- Loading state works during fetch
</success_criteria>

<output>
After completion, create `.planning/phases/02-artist-application-flow/02-01-browse-events-filter-SUMMARY.md`
</output>
