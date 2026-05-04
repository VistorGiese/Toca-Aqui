---
phase: 02-artist-application-flow
plan: 03
type: execute
wave: 2
depends_on: ["02-02"]
files_modified:
  - backend-TocaAqui/src/services/BandApplicationService.ts
  - TocaAqui/screens/artist/MyApplications.tsx
autonomous: true
requirements: [REQ-06]

must_haves:
  truths:
    - "MyApplications exibe candidaturas reais com status correto (pendente / aceito / recusado)"
    - "Aba Recusadas mostra candidaturas rejeitadas pelo backend (status normalizado de rejeitado para recusado)"
    - "Tela atualiza automaticamente ao voltar via navegacao (useFocusEffect)"
    - "Card de candidatura exibe valor_proposto quando disponivel"
  artifacts:
    - path: "backend-TocaAqui/src/services/BandApplicationService.ts"
      provides: "getApplicationsByArtist retorna valor_proposto e normaliza status"
      contains: "valor_proposto"
    - path: "TocaAqui/screens/artist/MyApplications.tsx"
      provides: "useFocusEffect para re-fetch e exibicao de valor_proposto"
      contains: "useFocusEffect"
  key_links:
    - from: "TocaAqui/screens/artist/MyApplications.tsx"
      to: "TocaAqui/http/bandApplicationService.ts"
      via: "bandApplicationService.getMyApplications() on focus"
      pattern: "useFocusEffect.*fetchApplications"
    - from: "backend-TocaAqui/src/services/BandApplicationService.ts"
      to: "BandApplicationModel"
      via: "getApplicationsByArtist maps valor_proposto and normalizes status"
      pattern: "valor_proposto.*a\\.valor_proposto"
---

<objective>
Corrigir MyApplications para exibir candidaturas reais com status correto, re-fetch ao focar, e valor_proposto no card.

Purpose: REQ-06 — Artista pode ver suas candidaturas em MyApplications com status atualizado (pendente / aceito / recusado). Atualmente: falta useFocusEffect (nao atualiza ao voltar), status 'rejeitado' do backend nao casa com 'recusado' do frontend, e valor_proposto nao aparece no retorno.
Output: Backend normaliza status e inclui valor_proposto; frontend usa useFocusEffect e exibe valor_proposto nos cards.
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
@.planning/phases/02-artist-application-flow/02-02-apply-to-gig-SUMMARY.md

<interfaces>
<!-- Key types and contracts the executor needs. -->

From TocaAqui/http/bandApplicationService.ts (BandApplication interface — already has valor_proposto):
```typescript
export interface BandApplication {
  id: number;
  evento_id: number;
  banda_id?: number;
  artista_id?: number;
  mensagem?: string;
  status: "pendente" | "aceito" | "recusado";
  nome_evento?: string;
  data_show?: string;
  horario_inicio?: string;
  horario_fim?: string;
  cache_minimo?: number;
  cache_maximo?: number;
  valor_proposto?: number;
  nome_estabelecimento?: string;
  cidade?: string;
  created_at?: string;
}
```

From backend-TocaAqui/src/services/BandApplicationService.ts (getApplicationsByArtist, lines 317-328):
```typescript
return aplicacoes.map((a: any) => ({
  id: a.id,
  status: a.status,  // <-- currently returns 'rejeitado' from DB, needs normalization to 'recusado'
  mensagem: a.mensagem,
  data_aplicacao: a.data_aplicacao,
  evento_id: a.evento_id,
  nome_evento: a.Event?.titulo_evento ?? null,
  data_show: a.Event?.data_show ?? null,
  horario_inicio: a.Event?.horario_inicio ?? null,
  horario_fim: a.Event?.horario_fim ?? null,
  nome_estabelecimento: a.Event?.EstablishmentProfile?.nome_estabelecimento ?? null,
  // valor_proposto is MISSING — must be added
}));
```

Established useFocusEffect pattern (from EstGigs.tsx):
```typescript
import { useFocusEffect } from "@react-navigation/native";
useFocusEffect(useCallback(() => { load(); }, [load]));
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add valor_proposto and normalize rejeitado to recusado in getApplicationsByArtist</name>
  <files>backend-TocaAqui/src/services/BandApplicationService.ts</files>
  <read_first>
    - backend-TocaAqui/src/services/BandApplicationService.ts
  </read_first>
  <action>
In the `getApplicationsByArtist` method (around line 317), update the return mapping to:

1. **Normalize status**: Change `status: a.status` to:
```typescript
status: a.status === 'rejeitado' ? 'recusado' : a.status,
```

2. **Add valor_proposto**: Add after `nome_estabelecimento`:
```typescript
valor_proposto: a.valor_proposto ?? null,
```

The complete updated map should be:
```typescript
return aplicacoes.map((a: any) => ({
  id: a.id,
  status: a.status === 'rejeitado' ? 'recusado' : a.status,
  mensagem: a.mensagem,
  data_aplicacao: a.data_aplicacao,
  evento_id: a.evento_id,
  nome_evento: a.Event?.titulo_evento ?? null,
  data_show: a.Event?.data_show ?? null,
  horario_inicio: a.Event?.horario_inicio ?? null,
  horario_fim: a.Event?.horario_fim ?? null,
  nome_estabelecimento: a.Event?.EstablishmentProfile?.nome_estabelecimento ?? null,
  valor_proposto: a.valor_proposto ?? null,
}));
```

This ensures:
- The frontend tab "Recusadas" which filters by `status === "recusado"` will now correctly show rejected applications
- The backend enum `ApplicationStatus.REJEITADO = 'rejeitado'` is not modified — normalization happens only in the response mapping
- `valor_proposto` is available for display in MyApplications cards (populated after 02-02 migration runs)
  </action>
  <verify>
    <automated>cd backend-TocaAqui && npx ts-node -e "import('./src/services/BandApplicationService').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"</automated>
  </verify>
  <acceptance_criteria>
    - BandApplicationService.ts getApplicationsByArtist contains `a.status === 'rejeitado' ? 'recusado' : a.status`
    - BandApplicationService.ts getApplicationsByArtist contains `valor_proposto: a.valor_proposto ?? null`
    - The original `ApplicationStatus` enum is NOT modified (still has `REJEITADO = 'rejeitado'`)
  </acceptance_criteria>
  <done>Backend returns normalized status (recusado instead of rejeitado) and includes valor_proposto in artist applications response</done>
</task>

<task type="auto">
  <name>Task 2: Replace useEffect with useFocusEffect and display valor_proposto in MyApplications cards</name>
  <files>TocaAqui/screens/artist/MyApplications.tsx</files>
  <read_first>
    - TocaAqui/screens/artist/MyApplications.tsx
    - TocaAqui/screens/establishment/EstGigs.tsx
  </read_first>
  <action>
**1. Add useFocusEffect import:**

Add to the existing `@react-navigation/native` import (or add a new import if none exists):
```typescript
import { useFocusEffect } from "@react-navigation/native";
```

**2. Replace useEffect with useFocusEffect:**

Find the `useEffect` that calls the fetch function (pattern: `useEffect(() => { fetchApplications(); }, [])` or similar). Replace it with:
```typescript
useFocusEffect(
  useCallback(() => {
    fetchApplications();
  }, [fetchApplications])
);
```

Make sure `useCallback` is imported from `react` (it likely already is since `fetchApplications` is wrapped in `useCallback`). Remove the old `useEffect` call that was responsible for the initial fetch — `useFocusEffect` handles both initial mount AND re-focus.

Do NOT remove the `useEffect` that is NOT related to fetching (if any exist for other purposes).

**3. Display valor_proposto in application cards:**

Find where each application card is rendered (likely in a `renderItem` or inline `FlatList` render function). In each card, add a line showing `valor_proposto` when available. Place it near the status or event info:

```typescript
{item.valor_proposto != null && (
  <Text style={{ color: DS.textSec, fontSize: 13, marginTop: 2 }}>
    Valor proposto: R$ {Number(item.valor_proposto).toFixed(2).replace('.', ',')}
  </Text>
)}
```

Use `DS.textSec` for the color (matching the established design system pattern). Place this text AFTER the event name / date info and BEFORE the status badge. If there is a specific card component being used, add it inside the card body.

Note: `item.valor_proposto` comes from the `BandApplication` interface which already has `valor_proposto?: number` — no type change needed.
  </action>
  <verify>
    <automated>cd TocaAqui && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <acceptance_criteria>
    - MyApplications.tsx contains `import { useFocusEffect } from "@react-navigation/native"`
    - MyApplications.tsx contains `useFocusEffect(` with `fetchApplications` inside the callback
    - MyApplications.tsx does NOT have a `useEffect` that calls `fetchApplications` (the old one must be removed)
    - MyApplications.tsx contains `valor_proposto` in the card rendering (display text)
    - MyApplications.tsx contains `Number(item.valor_proposto).toFixed(2)` or equivalent formatting
  </acceptance_criteria>
  <done>MyApplications re-fetches on screen focus, shows valor_proposto in cards, and status tabs work correctly with normalized status</done>
</task>

</tasks>

<verification>
- Backend getApplicationsByArtist returns `status: "recusado"` for rejected applications (not "rejeitado")
- Backend getApplicationsByArtist includes `valor_proposto` in response
- MyApplications uses useFocusEffect instead of useEffect for data fetching
- Cards display "Valor proposto: R$ X,XX" when valor_proposto is available
- Tab "Recusadas" correctly shows rejected applications
- TypeScript compiles without errors
</verification>

<success_criteria>
- MyApplications lists candidaturas with correct status in each tab (pendente / aceito / recusado)
- Status updates when navigating back to the screen (useFocusEffect)
- Cards show valor_proposto formatted as currency
</success_criteria>

<output>
After completion, create `.planning/phases/02-artist-application-flow/02-03-my-applications-status-SUMMARY.md`
</output>
