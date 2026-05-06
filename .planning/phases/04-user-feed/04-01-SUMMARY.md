---
phase: 04-user-feed
plan: "01"
subsystem: user-feed
tags: [frontend, backend, feed, filter, ux]
dependency_graph:
  requires: []
  provides: [user-feed-real-data, esta_hoje-filter]
  affects: [TocaAqui/screens/user/UserFeed.tsx, TocaAqui/http/showService.ts, backend-TocaAqui/src/services/ShowService.ts, backend-TocaAqui/src/controllers/ShowController.ts]
tech_stack:
  added: []
  patterns: [query-param-boolean-filter, dynamic-section-label]
key_files:
  created: []
  modified:
    - TocaAqui/screens/user/UserFeed.tsx
    - TocaAqui/http/showService.ts
    - backend-TocaAqui/src/services/ShowService.ts
    - backend-TocaAqui/src/controllers/ShowController.ts
decisions:
  - "titulo_evento is the single source of truth for event titles — no fallback to nome_banda"
  - "Hoje filter uses esta_hoje=true param sent to backend, filtering data_show within today's 00:00–23:59 range"
  - "Dynamic section label uses activeFilter state — no hardcoded text"
metrics:
  duration: ~5 min
  completed: "2026-04-02"
  tasks: 2
  files: 4
---

# Phase 04 Plan 01: User Feed Corrections Summary

UserFeed corrected with real data: titulo_evento as card title, esta_hoje filter working end-to-end (frontend param + backend date range), VER TODOS button removed, and section label reflecting active filter dynamically.

## What Was Done

### Task 1: Add esta_hoje filter to backend (ShowService + ShowController)
**Commit:** `4fab1e0`

- Added `esta_hoje?: boolean` to `getPublicShows` params type in `ShowService.ts`
- Inserted `else if (params.esta_hoje)` block between `fim_de_semana` and the final `else`, filtering `data_show` between `hoje 00:00:00` and `hoje 23:59:59`
- Extracted `esta_hoje` from `req.query` in `ShowController.ts` and passed as `esta_hoje === 'true'` boolean to service

### Task 2: Fix UserFeed — title, Hoje filter, dynamic label, remove VER TODOS
**Commit:** `0e39655`

- Added `esta_hoje?: boolean` to `ShowsParams` interface in `showService.ts`
- Fixed `getShowTitle` to return `show.titulo_evento` unconditionally (removed `show.Contract?.Band?.nome_banda` fallback)
- Added `else if (filter === "Hoje") { params.esta_hoje = true; }` block in `loadShows`
- Removed `<TouchableOpacity>` wrapping "VER TODOS" text from Em Destaque section header
- Replaced hardcoded `<Text>Esta semana</Text>` with `<Text>{activeFilter}</Text>` for dynamic filter label

## Verification Results

- Backend `npx tsc --noEmit`: zero errors
- Frontend `npx tsc --noEmit`: pre-existing unrelated errors in other files — no new errors introduced by this plan's changes (UserFeed.tsx and showService.ts appear clean)
- All 4 acceptance criteria met per plan

## Deviations from Plan

None - plan executed exactly as written.

Task 1 had already been committed (`4fab1e0`) prior to this agent's invocation. Task 2 changes were present in the working directory as unstaged modifications and were committed as `0e39655`.

## Known Stubs

None. UserFeed fetches real data via `showService.getPublicShows()` and `showService.getShowsDestaque()`. The empty state "Nenhum show encontrado" is a valid runtime state (no shows today), not a placeholder.

## Self-Check: PASSED

- [x] TocaAqui/screens/user/UserFeed.tsx — modified and committed in 0e39655
- [x] TocaAqui/http/showService.ts — modified and committed in 0e39655
- [x] backend-TocaAqui/src/services/ShowService.ts — modified and committed in 4fab1e0
- [x] backend-TocaAqui/src/controllers/ShowController.ts — modified and committed in 4fab1e0
