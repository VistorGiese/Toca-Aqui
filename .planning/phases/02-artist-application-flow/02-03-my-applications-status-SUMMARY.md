---
phase: 02-artist-application-flow
plan: 03
subsystem: api, ui
tags: [react-native, sequelize, typescript, candidatura, useFocusEffect, valor_proposto, status-normalization]

# Dependency graph
requires:
  - phase: 02-artist-application-flow
    plan: 02
    provides: valor_proposto column in aplicacoes_banda_evento via migration
provides:
  - Backend getApplicationsByArtist normalizes rejeitado→recusado and exposes valor_proposto
  - MyApplications uses useFocusEffect for automatic re-fetch on screen focus
  - Cards display valor_proposto as formatted currency when available
affects:
  - 03-contract-flow

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useFocusEffect + useCallback pattern for screen re-fetch on navigation focus
    - Status normalization at response-mapping layer — enum unchanged, normalization in map()

key-files:
  created: []
  modified:
    - backend-TocaAqui/src/services/BandApplicationService.ts
    - TocaAqui/screens/artist/MyApplications.tsx

key-decisions:
  - "Status normalization happens only at response mapping, not at enum level — ApplicationStatus.REJEITADO stays 'rejeitado' in DB"
  - "useFocusEffect replaces useEffect entirely for initial fetch — handles both mount and re-focus in one hook"
  - "Dead cancelado filter removed — not in BandApplication status union type"

requirements-completed: [REQ-06]

# Metrics
duration: 2min
completed: 2026-04-02
---

# Phase 02 Plan 03: My Applications Status Summary

**Backend normaliza rejeitado→recusado e expoe valor_proposto; MyApplications usa useFocusEffect para re-fetch automatico e exibe valor_proposto formatado nos cards**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-02T03:09:06Z
- **Completed:** 2026-04-02T03:11:11Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- getApplicationsByArtist normaliza status rejeitado→recusado na camada de mapeamento sem alterar o enum ApplicationStatus do banco
- getApplicationsByArtist expoe valor_proposto via `a.valor_proposto ?? null` — complementa migration da fase 02-02
- MyApplications substitui useEffect por useFocusEffect: a tela re-busca candidaturas ao ser focada (apos voltar da tela de candidatura, por exemplo)
- Cards exibem "Valor proposto: R$ X,XX" quando valor_proposto esta disponivel, usando DS.textSec e toFixed(2)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add valor_proposto and normalize rejeitado→recusado in getApplicationsByArtist** - `16e8cc2` (fix)
2. **Task 2: Replace useEffect with useFocusEffect and display valor_proposto in MyApplications cards** - `d5c601b` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `backend-TocaAqui/src/services/BandApplicationService.ts` - Normalizacao de status e adicao de valor_proposto no mapeamento de getApplicationsByArtist
- `TocaAqui/screens/artist/MyApplications.tsx` - useFocusEffect substituindo useEffect, exibicao de valor_proposto no card, remocao de filtro morto (cancelado)

## Decisions Made

- Status normalization happens only at response mapping layer (`status: a.status === 'rejeitado' ? 'recusado' : a.status`) — o enum `ApplicationStatus.REJEITADO = 'rejeitado'` permanece intocado no banco e models
- `useFocusEffect` substitui `useEffect` inteiramente — nao ha necessidade de manter ambos, pois useFocusEffect dispara tambem na montagem inicial
- Filtro `a.status === "cancelado"` removido (Rule 1 — Bug): o tipo BandApplication define `status: "pendente" | "aceito" | "recusado"`, portanto a comparacao era sempre false e gerava erro TS2367

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed dead "cancelado" filter in getFiltered**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** `a.status === "cancelado"` comparison in the Recusadas tab filter was a type error (TS2367) — BandApplication.status union does not include "cancelado"
- **Fix:** Removed the `|| a.status === "cancelado"` condition; filter now checks only `a.status === "recusado"`
- **Files modified:** `TocaAqui/screens/artist/MyApplications.tsx`
- **Commit:** d5c601b (same commit as Task 2)

## Known Stubs

None — MyApplications now fetches real data from backend via getMyApplications and displays actual status and valor_proposto.

## Self-Check: PASSED

- [x] `backend-TocaAqui/src/services/BandApplicationService.ts` modified and committed (16e8cc2)
- [x] `TocaAqui/screens/artist/MyApplications.tsx` modified and committed (d5c601b)
- [x] Both commits verified in git log
- [x] No TypeScript errors in MyApplications.tsx
- [x] ApplicationStatus.REJEITADO enum unchanged (still 'rejeitado' in BandApplicationModel.ts)

---
*Phase: 02-artist-application-flow*
*Completed: 2026-04-02*
