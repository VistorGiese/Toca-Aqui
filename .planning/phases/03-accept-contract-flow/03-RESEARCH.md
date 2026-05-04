# Phase 3: Accept & Contract Flow - Research

**Researched:** 2026-04-02
**Domain:** React Native (Expo) + Express/Sequelize — establishment accept flow, contract generation, artist confirmation
**Confidence:** HIGH — all findings from direct source code inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**valor_proposto em EstGigApplications**
- D-01: Exibir `valor_proposto` como linha extra no card de candidatura (abaixo da mensagem do artista), consistente com o padrão de MyApplications em Phase 2
- D-02: Quando `valor_proposto` é null/undefined, exibir "A combinar" — nunca omitir a linha completamente
- D-03: Interface `Candidatura` em `establishmentService.ts` deve incluir `valor_proposto?: number`
- D-04: Tab "favoritas" e botão coração ficam sem funcionalidade real (ignorar por enquanto — fora do escopo da defesa)

**valor_proposto em EstAcceptContract**
- D-05: Adicionar exibição de `valor_proposto` no `infoCard` de EstAcceptContract — estabelecimento vê e confirma o valor antes de aceitar
- D-06: Passar `valorProposto?: number` como param adicional via `navigation.navigate("EstAcceptContract", { applicationId, artistId, artistName, gigTitle, valorProposto })`
- D-07: `EstStackParamList.EstAcceptContract` deve adicionar `valorProposto?: number` (opcional)

**Navegação pós-aceite (EstAcceptContract → EstShowDetail)**
- D-08: Modificar `acceptBandApplication` no backend para retornar `{ message, aplicacao, contrato }` — `contractService.generateFromApplication()` já retorna o contrato
- D-09: Frontend extrai `contrato.id` do response de `acceptApplication` e navega para `EstShowDetail` com `{ contractId: contrato.id }`
- D-10: Fluxo: `Alert.alert("Candidatura aceita!", "[Nome] foi contratado(a).", [{ text: "OK", onPress: () => navigation.navigate("EstShowDetail", { contractId }) }])`

**Acesso ao ContractDetail pelo artista (MyApplications → ContractDetail)**
- D-11: Backend deve incluir `contrato_id: number | null` na resposta de `/eventos/minhas`
- D-12: `BandApplication` interface no frontend deve incluir `contrato_id?: number`
- D-13: Em MyApplications, cards com `status === "aceito"` e `contrato_id` presente exibem botão "VER CONTRATO" separado abaixo do badge de status
- D-14: Botão "VER CONTRATO" navega para `ContractDetail` com `{ contractId: item.contrato_id }`

**ContractDetail — pós-assinatura**
- D-15: Após `acceptContract` com sucesso, navegar para `ArtistSchedule` (em vez de `goBack()`)
- D-16: Alert "Contrato assinado!" com mensagem "Parabéns! O show foi confirmado. Abrindo sua agenda..." antes de navegar

**Feedback de recusa (REQ-07)**
- D-17: Status "recusado" visível em MyApplications é suficiente para REQ-07 — nenhuma notificação in-app adicional
- D-18: Backend já envia `APLICACAO_ACEITA` + `CONTRATO_GERADO` para o artista aceito — coberto sem mudança

### Claude's Discretion
- Formatação do valor proposto: `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
- `useFocusEffect` em EstGigApplications pode ser adicionado se necessário, mas `useEffect` é suficiente para o fluxo da demo
- Tratamento de erros: `Alert.alert("Erro", msg)` no catch — padrão existente

### Deferred Ideas (OUT OF SCOPE)
- Tab "favoritas" com funcionalidade real
- Notificação in-app para artistas recusados
- Edição de termos do contrato (cláusulas, penalidades)
- Histórico de contratos completo
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-07 | Artista recebe feedback quando sua candidatura é aceita ou recusada | Status "recusado" em MyApplications via backend bulk-reject — D-17 |
| REQ-08 | Artista pode visualizar o contrato gerado e confirmar aceite | ContractDetail.handleAssinar → contractService.acceptContract — D-15/D-16 |
| REQ-09 | Estabelecimento pode criar um evento (EstNewGig) | Already implemented in Phase 2 — EstNewGig.tsx functional |
| REQ-10 | Estabelecimento pode visualizar candidaturas com valor_proposto | EstGigApplications + Candidatura interface update — D-01/D-02/D-03 |
| REQ-11 | Estabelecimento pode aceitar uma candidatura específica | EstAcceptContract.handleAccept → establishmentService.acceptApplication — D-08/D-09/D-10 |
| REQ-12 | Ao aceitar uma candidatura, sistema recusa automaticamente as demais | BandApplicationService.accept() already does bulk-reject via Op.ne — backend is correct |
| REQ-13 | Ao aceitar, contrato gerado com status `aguardando_aceite` | ContractService.generateFromApplication creates with status RASCUNHO — CRITICAL BUG (see Pitfalls) |
| REQ-14 | Estabelecimento pode visualizar EstShowDetail após artista assinar | EstShowDetail receives contractId param — data_show vs data_evento field mismatch (see Pitfalls) |
</phase_requirements>

---

## Summary

Phase 3 connects the acceptance half of the contracting flow. The codebase already has all four screens (EstGigApplications, EstAcceptContract, EstShowDetail, ContractDetail) and all backend services (BandApplicationService.accept, ContractService.generateFromApplication, ContractService.acceptContract). The work is almost entirely **wiring and small corrections** — not new features.

The most impactful backend gap is that `ContractService.generateFromApplication` creates contracts with `status: ContractStatus.RASCUNHO` (not `aguardando_aceite` as REQ-13 requires) and `cache_total: 0` (not seeded from `valor_proposto`). The planner must include both fixes in plan 03-02.

On the frontend, the `Candidatura` interface is missing `valor_proposto` and `contrato_id`. The `acceptApplication` call in `establishmentService.ts` points to a wrong route (`/eventos/:id/aceitar` instead of `/candidaturas/:id/aceitar`). The `Contract` interface in `contractService.ts` uses `cache_acordado` and `data_show` field names that don't match the actual ContractModel column names (`cache_total` and `data_evento`), causing blank values in EstShowDetail and ContractDetail.

**Primary recommendation:** Fix routes and field name mismatches before any UI additions — silent data failures are harder to debug than missing UI elements.

---

## Standard Stack

### Core (all already installed — no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-navigation/native-stack | project version | Screen-to-screen navigation | Already used throughout app |
| react-native Alert | built-in | Confirmation dialogs | Established pattern in every action screen |
| Sequelize Op | project version | Bulk update / NOT IN queries | Used in BandApplicationService.accept |
| axios | project version | HTTP client in frontend services | All services use `api` (axios instance) |

**No new packages needed for this phase.**

---

## Architecture Patterns

### Established Pattern: Navigator param passing
```typescript
// EstGigApplications.tsx → EstAcceptContract
navigation.navigate("EstAcceptContract", {
  applicationId: item.id,
  artistId: item.artista_id ?? item.banda_id,
  artistName: item.nome_artista ?? "Artista",
  gigTitle,
  valorProposto: item.valor_proposto,   // ADD THIS
});
```

Route type must be updated in `EstStackParamList`:
```typescript
EstAcceptContract: {
  applicationId: number;
  artistId?: number;
  artistName: string;
  gigTitle: string;
  valorProposto?: number;  // ADD THIS
};
```

### Established Pattern: acceptApplication response extraction
Current `acceptApplication` in `establishmentService.ts` only returns `r.data` without typing. After the backend fix that adds `contrato` to the response, the frontend must extract it:
```typescript
const acceptApplication = async (applicationId: number): Promise<{ message: string; aplicacao: any; contrato: { id: number } }> => {
  const r = await api.put(`/candidaturas/${applicationId}/aceitar`);  // FIX ROUTE (see Pitfalls)
  return r.data;
};
```

### Established Pattern: navigation to ArtistSchedule after sign
`ArtistSchedule` is a bottom-tab screen inside `ArtistNavigator`. From `ContractDetail` (also inside `ArtistNavigator` stack), `navigation.navigate("ArtistSchedule")` requires navigating to the tab — not just a stack pop. The correct call is:
```typescript
// ContractDetail.tsx — after acceptContract success
navigation.navigate("ArtistTabs", { screen: "ArtistSchedule" });
// OR simply (since ArtistSchedule is a tab in ArtistTabParamList):
navigation.navigate("ArtistTabs");
```
Actually `ArtistStackParamList` does NOT include `ArtistSchedule` as a stack route. The tabs are under `ArtistTabs`. To navigate from a stack screen (ContractDetail) to a tab screen (ArtistSchedule) the correct call is:
```typescript
// Works because ArtistTabs is the first screen in the stack
(navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" });
```
Or simply pop back to tabs (since ContractDetail sits on top of the tab stack):
```typescript
navigation.popToTop();  // returns to ArtistTabs, which shows the last active tab
```
The safest approach for the demo: use `navigation.navigate("ArtistTabs")` which will land on whatever tab is active — but D-15 wants ArtistSchedule specifically. Use:
```typescript
navigation.reset({ index: 0, routes: [{ name: "ArtistTabs", state: { routes: [{ name: "ArtistSchedule" }] } }] });
```
Or the simpler `navigation.popToTop()` and rely on the user having ArtistSchedule as the active tab. **Recommendation:** Use `(navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" })` — this is the idiomatic React Navigation nested navigator call and works without TypeScript gymnastics by casting.

### Anti-Patterns to Avoid
- **Navigating to ArtistSchedule as a stack route:** `navigation.navigate("ArtistSchedule")` will fail with TypeScript error because `ArtistSchedule` is not in `ArtistStackParamList`. It is a tab, not a stack screen.
- **Assuming `cache_acordado` exists on the contract:** ContractModel has `cache_total`, not `cache_acordado`. EstShowDetail and ContractDetail both reference `cache_acordado` — this renders R$ 0,00 for every contract.
- **Assuming the `/eventos/:id/aceitar` route is for accepting a candidatura:** That route does not exist. The real route is `/candidaturas/:id/aceitar` as registered in `BandApplicationRoutes.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bulk-reject remaining applications | Custom loop | `BandApplicationModel.update({ status: 'rejeitado' }, { where: { evento_id, id: Op.ne, status: 'pendente' } })` | Already done in `BandApplicationService.accept()` |
| Contract creation from application | Custom factory | `contractService.generateFromApplication(aplicacao.id)` | Already called inside `accept()` — just needs return value exposed |
| Role determination for contract access | Custom checks | `contractService.getUserRole(contractId, req.user.id)` | Used in ContractController — handles both artista and banda |

---

## Critical Bugs Found

These must be fixed in plans. Each is documented as a pitfall below.

### Bug 1 — Wrong route in `establishmentService.acceptApplication`
**File:** `TocaAqui/http/establishmentService.ts` line 113
**Current:** `api.put('/eventos/${applicationId}/aceitar')`
**Correct:** `api.put('/candidaturas/${applicationId}/aceitar')`
**Evidence:** `BandApplicationRoutes.ts` registers `router.put("/:id/aceitar", ...)` on the `/candidaturas` prefix (confirmed by route file).
**Impact:** Every accept attempt returns 404. Nothing else works until this is fixed.

### Bug 2 — Wrong route in `establishmentService.rejectApplication`
**File:** `TocaAqui/http/establishmentService.ts` line 118
**Current:** `api.put('/eventos/${applicationId}/recusar')`
**Correct:** `api.put('/candidaturas/${applicationId}/recusar')`
**Impact:** Every individual reject attempt returns 404.

### Bug 3 — `getGigApplications` calls wrong endpoint
**File:** `TocaAqui/http/establishmentService.ts` line 108
**Current:** `api.get('/eventos/${eventoId}')` — returns the event object, not its candidaturas
**Correct:** `api.get('/candidaturas/${eventoId}')` which maps to `BandApplicationRoutes GET /:evento_id`
**Evidence:** `BandApplicationRoutes.ts` line 25: `router.get("/:evento_id", getBandApplicationsForEvent)`; the prefix for this router is `/candidaturas` (must verify in app.ts/routes index).
**Note:** Need to verify the mount path — see Open Questions below.

### Bug 4 — Contract created with `status: RASCUNHO` instead of `aguardando_aceite`
**File:** `backend-TocaAqui/src/services/ContractService.ts` line 82
**Current:** `status: ContractStatus.RASCUNHO`
**Correct for REQ-13:** `status: ContractStatus.AGUARDANDO_ACEITE`
**Impact:** REQ-13 explicitly requires `aguardando_aceite`. The `acceptContract` service accepts both statuses (`RASCUNHO` and `AGUARDANDO_ACEITE`), but the guard `if (Number(contrato.cache_total) <= 0)` will also block the artist from accepting because `cache_total` defaults to 0.

### Bug 5 — `cache_total: 0` ignores `valor_proposto`
**File:** `backend-TocaAqui/src/services/ContractService.ts` line 103
**Current:** `cache_total: 0` hardcoded
**Correct:** Seed from `aplicacao.valor_proposto ?? 0` so the contract shows the negotiated value
**Impact:** EstShowDetail, ContractDetail, and `acceptContract` guard all display or block on this value.

### Bug 6 — `acceptContract` guard blocks artist sign when `cache_total = 0`
**File:** `backend-TocaAqui/src/services/ContractService.ts` line 274
**Current:** `if (Number(contrato.cache_total) <= 0) throw AppError('Defina o valor do cachê...')`
**Impact:** With Bug 5 unresolved, the artist will always see "Defina o valor do cachê antes de aceitar o contrato" error. Fix Bug 5 to seed `cache_total` from `valor_proposto`, OR relax this guard for the TCC demo (zero-value contracts should be acceptable).
**Recommendation:** Fix Bug 5 (seed from valor_proposto). If valor_proposto is null, seed `cache_total: 0` AND relax the guard to only throw when `cache_total < 0`.

### Bug 7 — `acceptBandApplication` controller does not return `contrato`
**File:** `backend-TocaAqui/src/controllers/BandApplicationController.ts` lines 20-24
**Current:** Returns `{ message, aplicacao }` — the `contrato` variable from `bandApplicationService.accept()` is never captured or returned
**Correct:** `bandApplicationService.accept()` must return `{ aplicacao, contrato }` and the controller must include `contrato` in the response
**Impact:** D-09 (navigate to EstShowDetail with contractId) cannot work without the contrato id in the response.

### Bug 8 — Field name mismatch: `cache_acordado` vs `cache_total`
**File:** `TocaAqui/screens/establishment/EstShowDetail.tsx` line 112 and `TocaAqui/screens/artist/ContractDetail.tsx` line 225
**Current:** Both reference `contract.cache_acordado`
**Actual field:** ContractModel has `cache_total` (confirmed in ContractModel.ts line 47)
**Impact:** Both screens display R$ 0,00 for the cachê.

### Bug 9 — Field name mismatch: `data_show` vs `data_evento`
**File:** `TocaAqui/http/contractService.ts` line 14 — `Contract` interface uses `data_evento`
**EstShowDetail:** References `contract.data_show` (line 109)
**ContractDetail:** References `contract.data_show` (line 135) — but the interface uses `data_evento`
**Actual DB field:** ContractModel uses `data_evento`
**Impact:** Date displays "Data não informada" even when the contract has a date.

### Bug 10 — `getMyApplications` does not include `contrato_id`
**File:** `backend-TocaAqui/src/services/BandApplicationService.ts` `getApplicationsByArtist()` line 317
**Current:** Returns map without `contrato_id` field
**Required by D-11:** Backend must JOIN to ContractModel and include `contrato_id: number | null` in the response
**Impact:** Artist cannot navigate to ContractDetail from MyApplications (D-14).

---

## Common Pitfalls

### Pitfall 1: Route prefix confusion — candidaturas vs eventos
**What goes wrong:** `establishmentService.ts` calls `/eventos/:id/aceitar` — this matches nothing in the router. The event routes and band application routes are mounted on different prefixes.
**Why it happens:** The developer conflated event ID with application ID semantically.
**How to avoid:** Always check `BandApplicationRoutes.ts` registration AND the mount path in the main routes file before writing any URL.
**Warning signs:** 404 response from accept/reject actions.

### Pitfall 2: `BandApplicationService.accept()` returns `aplicacao` not `{ aplicacao, contrato }`
**What goes wrong:** The `contrato` local variable (line 125 in BandApplicationService.ts) is used for notifications but never returned. The controller therefore cannot pass it to the frontend.
**How to avoid:** Change `return aplicacao` (line 213) to `return { aplicacao, contrato }` and update both the controller and the TypeScript return type.

### Pitfall 3: Nested navigator navigation from ContractDetail to ArtistSchedule
**What goes wrong:** `navigation.navigate("ArtistSchedule")` fails TypeScript because `ArtistSchedule` is not in `ArtistStackParamList`.
**Why it happens:** `ArtistSchedule` is a tab screen in `ArtistTabParamList`, not a stack detail screen.
**How to avoid:** Use `(navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" })` for navigation from stack to tab.

### Pitfall 4: `acceptContract` guard blocks zero-cache contracts
**What goes wrong:** `ContractService.acceptContract` throws "Defina o valor do cachê antes de aceitar o contrato" when `cache_total = 0`.
**Why it happens:** Contracts are created with `cache_total: 0` and the guard protects against accepting un-negotiated contracts.
**How to avoid:** Seed `cache_total` from `valor_proposto` in `generateFromApplication`. If valor_proposto is null, set cache_total to 1 (symbolic) or relax the guard to `< 0`.

### Pitfall 5: `getApplicationsForEvent` response shape varies
**What goes wrong:** When event is open, backend returns an array. When event is closed (`aceito`), backend returns `{ closed: true, message, candidaturas: [...] }`. The frontend `getGigApplications` uses `toArray()` which only handles known keys — `candidaturas` IS in the `toArray` key list, so it works for closed events. But confirms the array case works for open events.
**How to avoid:** Use the `toArray()` helper already in `establishmentService.ts` — it handles both shapes.

---

## Code Examples

### Fixing `BandApplicationService.accept()` return type
```typescript
// backend-TocaAqui/src/services/BandApplicationService.ts
// Line 213 — change:
return aplicacao;
// To:
return { aplicacao, contrato };
// Update method signature return type accordingly
```

### Fixing `acceptBandApplication` controller
```typescript
// backend-TocaAqui/src/controllers/BandApplicationController.ts
export const acceptBandApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
  const id = req.params.id as string;
  const { aplicacao, contrato } = await bandApplicationService.accept(id);
  res.json({
    message: `Candidatura aceita. Demais candidaturas rejeitadas.`,
    aplicacao,
    contrato,
  });
});
```

### Fixing `generateFromApplication` status and cache
```typescript
// ContractService.ts — inside ContractModel.create({...})
status: ContractStatus.AGUARDANDO_ACEITE,   // was RASCUNHO
cache_total: aplicacao.valor_proposto ?? 0, // was hardcoded 0
valor_sinal: 0,
```

### Fixing `acceptApplication` in establishmentService.ts
```typescript
const acceptApplication = async (applicationId: number): Promise<any> => {
  const r = await api.put(`/candidaturas/${applicationId}/aceitar`);  // fixed route
  return r.data;  // now returns { message, aplicacao, contrato }
};
```

### Adding contrato_id to `getApplicationsByArtist`
```typescript
// BandApplicationService.ts — getApplicationsByArtist map()
// Need a JOIN or sub-query to ContractModel
// Simplest: findOne on ContractModel for each accepted application
// Or: use include with ContractModel association

// In the map:
const contrato = a.status === 'aceito'
  ? await ContractModel.findOne({ where: { aplicacao_id: a.id } })
  : null;
// Then in return object:
contrato_id: contrato?.id ?? null,
```
**Note:** This N+1 approach is acceptable for TCC demo scale. A JOIN would be cleaner but requires an association definition on BandApplicationModel.

### `Contract` interface — fix field names
```typescript
// TocaAqui/http/contractService.ts
export interface Contract {
  id: number;
  // ...
  cache_total?: number;      // was cache_acordado (does not exist)
  cache_acordado?: number;   // REMOVE — not a real field
  data_evento?: string;      // keep this — it IS the real field name
  data_show?: string;        // REMOVE — not a real ContractModel field
  // ...
  nome_evento?: string;      // verify this comes from Event association in getById
  nome_artista?: string;     // verify this comes from ArtistProfile association
}
```

### Navigating from ContractDetail to ArtistSchedule
```typescript
// ContractDetail.tsx handleAssinar success handler
Alert.alert(
  "Contrato assinado!",
  "Parabéns! O show foi confirmado. Abrindo sua agenda...",
  [{
    text: "OK",
    onPress: () => (navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" }),
  }]
);
```

---

## Integration Points — Detailed

### Plan 03-01 touches
| File | Change |
|------|--------|
| `TocaAqui/http/establishmentService.ts` | Add `valor_proposto?: number` and `contrato_id?: number` to `Candidatura` interface |
| `TocaAqui/http/establishmentService.ts` | Fix `getGigApplications` route (verify correct prefix) |
| `TocaAqui/navigation/EstablishmentNavigator.tsx` | Add `valorProposto?: number` to `EstAcceptContract` in `EstStackParamList` |
| `TocaAqui/screens/establishment/EstGigApplications.tsx` | Add valor_proposto display line in card; pass valorProposto to navigation |

### Plan 03-02 touches
| File | Change |
|------|--------|
| `backend-TocaAqui/src/services/BandApplicationService.ts` | Return `{ aplicacao, contrato }` from `accept()` |
| `backend-TocaAqui/src/controllers/BandApplicationController.ts` | Destructure `{ aplicacao, contrato }` and include in response |
| `backend-TocaAqui/src/services/ContractService.ts` | Change `status: RASCUNHO` to `AGUARDANDO_ACEITE`; seed `cache_total` from `aplicacao.valor_proposto` |
| `backend-TocaAqui/src/services/ContractService.ts` | Relax `acceptContract` guard to `< 0` or `<= 0` only when valor_proposto was null |
| `TocaAqui/http/establishmentService.ts` | Fix `acceptApplication` route to `/candidaturas/:id/aceitar` |
| `TocaAqui/screens/establishment/EstAcceptContract.tsx` | Extract `contrato.id` from response; navigate to EstShowDetail; display valorProposto |
| `backend-TocaAqui/src/services/BandApplicationService.ts` | Include `contrato_id` in `getApplicationsByArtist` response |

### Plan 03-03 touches
| File | Change |
|------|--------|
| `TocaAqui/http/contractService.ts` | Fix `Contract` interface: `cache_acordado` → `cache_total`, `data_show` → `data_evento`; add `nome_artista` |
| `TocaAqui/http/bandApplicationService.ts` | Add `contrato_id?: number` to `BandApplication` interface |
| `TocaAqui/screens/artist/MyApplications.tsx` | Add `navigation` prop threading to `ApplicationCard`; show "VER CONTRATO" button when accepted + contrato_id present |
| `TocaAqui/screens/artist/ContractDetail.tsx` | Fix field references (`cache_acordado` → `cache_total`, `data_show` → `data_evento`); change pós-assinatura navigation |

### Plan 03-04 touches
| File | Change |
|------|--------|
| `TocaAqui/screens/establishment/EstShowDetail.tsx` | Fix field reference `cache_acordado` → `cache_total`; fix `data_show` → `data_evento`; verify `nome_artista` comes from API response |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `contract.cache_acordado` | `contract.cache_total` | Both display screens show R$ 0,00 until fixed |
| `contract.data_show` | `contract.data_evento` | Date shows "Data não informada" until fixed |
| `return aplicacao` in accept() | `return { aplicacao, contrato }` | Frontend cannot navigate to EstShowDetail after accept |
| `status: RASCUNHO` in generateFromApplication | `status: AGUARDANDO_ACEITE` | REQ-13 not met |

---

## Open Questions

1. **Mount path for BandApplicationRoutes — `/candidaturas` or `/eventos`?**
   - What we know: `BandApplicationRoutes.ts` registers routes on `router` with no prefix. The routes are `GET /:evento_id`, `PUT /:id/aceitar`, etc.
   - What's unclear: The file where routes are mounted (`app.ts` or a routes index) was not read. The current `establishmentService.ts` uses `/eventos/:id/aceitar` — this is almost certainly wrong since it returns 404. The `bandApplicationService.ts` (frontend) uses `/candidaturas` for POST and `/eventos/minhas` for GET.
   - Recommendation: **Read the routes index file before Plan 03-01** to confirm the exact mount path. The planner should include "read app.ts or routes/index.ts" as the first task step in Plan 03-02.

2. **Does `ContractService.getById` include `nome_artista` and `nome_evento` in the response?**
   - What we know: `getById` includes associations: `Event`, `Band`, `EstablishmentProfile`, `Payments`. ArtistProfile is NOT included.
   - What's unclear: `EstShowDetail` accesses `contract.nome_artista` — this field must come from somewhere. Either the API serializes the associated ArtistProfile, or it's missing.
   - Recommendation: Add `{ association: 'ArtistProfile' }` to the `getById` include list. Also add `nome_evento` via the Event association if not already serialized.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code changes to existing React Native + Express files with no new external dependencies.

---

## Validation Architecture

`nyquist_validation` is explicitly `false` in `.planning/config.json` — this section is skipped.

---

## Sources

### Primary (HIGH confidence)
- Direct source code inspection of all canonical files listed in CONTEXT.md
  - `TocaAqui/http/establishmentService.ts` — route bugs confirmed
  - `TocaAqui/http/contractService.ts` — interface field mismatches confirmed
  - `backend-TocaAqui/src/services/BandApplicationService.ts` — accept() return value confirmed
  - `backend-TocaAqui/src/services/ContractService.ts` — RASCUNHO status and cache_total=0 confirmed
  - `backend-TocaAqui/src/controllers/BandApplicationController.ts` — missing contrato in response confirmed
  - `backend-TocaAqui/src/routes/BandApplicationRoutes.ts` — route registration confirmed
  - `TocaAqui/navigation/ArtistNavigator.tsx` — ArtistSchedule is a tab confirmed
  - `TocaAqui/screens/artist/MyApplications.tsx` — missing VER CONTRATO button confirmed
  - `TocaAqui/screens/artist/ContractDetail.tsx` — goBack() navigation confirmed
  - `TocaAqui/screens/establishment/EstShowDetail.tsx` — cache_acordado and data_show confirmed

### Open (needs verification before Plan 03-01)
- Routes mount path (app.ts / routes index) — LOW confidence on exact prefix for BandApplicationRoutes

---

## Metadata

**Confidence breakdown:**
- Bug inventory: HIGH — confirmed by direct file reading
- Fix approach: HIGH — patterns derived from existing working code in same codebase
- Navigation (ContractDetail → ArtistSchedule): MEDIUM — nested navigator navigation requires testing; casting approach is idiomatic but TypeScript may surface warnings
- Route prefix for candidaturas: MEDIUM — very likely `/candidaturas` based on `bandApplicationService.ts` POST `/candidaturas`, but mount path not directly verified from app.ts

**Research date:** 2026-04-02
**Valid until:** Phase execution (code is stable, no external dependencies)
