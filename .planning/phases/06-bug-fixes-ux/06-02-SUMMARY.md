---
phase: 06-bug-fixes-ux
plan: 02
subsystem: search
tags: [bug-fix, search, establishment, user, backend-route]
dependency_graph:
  requires: []
  provides: [artistas/busca endpoint, UserSearch resultados parsing]
  affects: [EstSearch, UserSearch]
tech_stack:
  added: []
  patterns: [Express route before parametric, robust response parsing]
key_files:
  created: []
  modified:
    - TocaAqui/http/establishmentService.ts
    - TocaAqui/screens/user/UserSearch.tsx
    - backend-TocaAqui/src/routes/ArtistaPublicoRoutes.ts
decisions:
  - "New backend GET /artistas/busca route added before /:id routes to avoid parametric capture"
  - "UserSearch parsing changed to use data.resultados (primary) with fallbacks for data.shows and data.data"
metrics:
  duration: 8min
  completed: 2026-04-03
  tasks_completed: 2
  files_modified: 3
---

# Phase 06 Plan 02: Search Bug Fixes Summary

**One-liner:** Fixed 404 in EstSearch (wrong endpoint) and silent failure in UserSearch (wrong response field `data.shows` vs actual `data.resultados`).

## What Was Built

Two search bugs fixed:

1. **EstSearch 404 fix** — `establishmentService.searchArtists` was calling `/perfis-artista/busca` which never existed in the backend. Fixed to call `/artistas/busca`. A new backend route `GET /artistas/busca` was added in `ArtistaPublicoRoutes.ts` before the parametric `/:id/publico` route to prevent capture. The route uses `ArtistProfileModel.findAll` with `Op.like` filters on `nome_artistico` and `generos`.

2. **UserSearch silent failure fix** — `fetchResults` was extracting results as `data.shows ?? []` but the backend `searchShows` controller spreads `{ tipo, resultados }` into the response body, so the actual field is `resultados`. Changed to `Array.isArray(data) ? data : (data?.resultados ?? data?.shows ?? data?.data ?? [])` for robustness.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Fix EstSearch endpoint 404 | 4e03fc1 | establishmentService.ts, ArtistaPublicoRoutes.ts |
| 2 | Fix UserSearch response parsing | 48ecf14 | UserSearch.tsx |

## Deviations from Plan

None - plan executed exactly as written. The plan correctly identified both the wrong endpoint and the wrong field name.

## Self-Check: PASSED

- [x] `grep "artistas/busca" TocaAqui/http/establishmentService.ts` → line 124 found
- [x] `grep "busca" backend-TocaAqui/src/routes/ArtistaPublicoRoutes.ts` → route at lines 13-14 found
- [x] `grep "Array.isArray\|data.resultados" TocaAqui/screens/user/UserSearch.tsx` → line 93 found
- [x] Commits 4e03fc1 and 48ecf14 exist in git log
