---
phase: 05-integration-polish
plan: 02
subsystem: api
tags: [sequelize, express, react-native, typescript, avaliacao, nota_media]

# Dependency graph
requires:
  - phase: 05-integration-polish
    provides: PUT /contratos/:id/concluir route (contracts must be concluded before rating)
provides:
  - POST /contratos/:id/avaliar-artista backend route restricted to contratante
  - nota_media recalculation on ArtistProfileModel after each rating
  - Fixed establishmentService.rateArtist calling correct endpoint
affects: [EstRateArtist screen, artist public profile stats display]

# Tech tracking
tech-stack:
  added: []
  patterns: [POST /:id/avaliar-artista mirrors existing POST /:id/avaliar pattern for inverse evaluation direction]

key-files:
  created: []
  modified:
    - backend-TocaAqui/src/controllers/ContractController.ts
    - backend-TocaAqui/src/routes/ContractRoutes.ts
    - TocaAqui/http/establishmentService.ts

key-decisions:
  - "avaliarArtista mirrors avaliarEstabelecimento pattern: ownership check, concluido guard, duplicate prevention, AvaliacaoShowModel.create"
  - "nota_media recalculated by averaging nota_artista across all avaliacoes_shows records linked to the artist's concluded contract events"
  - "nota_media rounded to 1 decimal place using Math.round(avg * 10) / 10"
  - "rateArtist body changed from { contrato_id, ...data } to just data — contratoId is now in URL path"

patterns-established:
  - "Evaluation endpoints follow /:id/avaliar-X pattern where X identifies who is being rated"
  - "nota_media recalculation queries all concluded contracts for artist then averages nota_artista"

requirements-completed: [REQ-17]

# Metrics
duration: 5min
completed: 2026-04-02
---

# Phase 05 Plan 02: Rate Artist Flow Summary

**POST /contratos/:id/avaliar-artista endpoint with nota_media recalculation, fixing EstRateArtist to call the correct route**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-02T21:39:00Z
- **Completed:** 2026-04-02T21:41:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `avaliarArtista` controller function to ContractController.ts with contratante ownership check, status guard, duplicate prevention, and nota_media recalculation
- Wired `POST /:id/avaliar-artista` route in ContractRoutes.ts with authMiddleware
- Fixed `establishmentService.rateArtist()` from calling `/avaliacoes` to `/contratos/${contratoId}/avaliar-artista`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add POST /contratos/:id/avaliar-artista backend route and controller** - `8ac920c` (feat)
2. **Task 2: Fix establishmentService.rateArtist to call correct endpoint** - `1742df8` (fix)

## Files Created/Modified
- `backend-TocaAqui/src/controllers/ContractController.ts` - Added `avaliarArtista` exported function with ownership check, AvaliacaoShowModel.create, and nota_media recalculation
- `backend-TocaAqui/src/routes/ContractRoutes.ts` - Added `avaliarArtista` import and `POST /:id/avaliar-artista` route
- `TocaAqui/http/establishmentService.ts` - Fixed `rateArtist` endpoint from `/avaliacoes` to `/contratos/${contratoId}/avaliar-artista`

## Decisions Made
- Mirrored the `avaliarEstabelecimento` controller pattern for `avaliarArtista` (inverse direction: contratante rates contratado)
- nota_media recalculation uses AVG of nota_artista across all avaliacoes linked to the artist's concluded contract events, rounded to 1 decimal
- Body sent from frontend is now just `{ nota, comentario, tags }` since `contratoId` is in the URL path

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- EstRateArtist UI is now connected to a working backend endpoint
- nota_media will be populated on artist profiles after ratings are submitted
- Ready for Plan 03 (loading-polish) or verification

---
*Phase: 05-integration-polish*
*Completed: 2026-04-02*
