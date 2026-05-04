---
phase: 01-foundation
plan: 02
subsystem: frontend-http
tags: [band-application, http-client, route-fix, typescript]
dependency_graph:
  requires: []
  provides: [bandApplicationService-aligned, valor_proposto-field, accept-reject-stubs]
  affects: [EstGigApplications, MyApplications, EventDetailArtist]
tech_stack:
  added: []
  patterns: [dual-response-shape-handling]
key_files:
  created: []
  modified:
    - TocaAqui/http/bandApplicationService.ts
decisions:
  - Fixed GET route from /band-applications/:id to /eventos/:id to match backend BandApplicationRoutes.ts
  - Handle dual response shapes (open: array, closed: {closed, candidaturas: []}) from getBandApplicationsForEvent
  - Added getMyApplications stub now (not blocked by missing backend route) so export object is complete
metrics:
  duration: 8m
  completed: 2026-04-01
  tasks_completed: 1
  files_modified: 1
---

# Phase 01 Plan 02: Fix Band Application Routes Summary

**One-liner:** Fixed bandApplicationService HTTP client to call correct /eventos routes and handle dual response shapes from closed/open events, plus added valor_proposto field and accept/reject stubs for Phase 3.

## What Was Built

Aligned the frontend `bandApplicationService.ts` with the backend `BandApplicationRoutes.ts`:

1. **Route fix** — `getApplicationsByEvent` was calling `/band-applications/${evento_id}` (404s on every call). Fixed to `/eventos/${evento_id}`.

2. **Dual response handling** — Backend `getBandApplicationsForEvent` returns an array for open events and `{ message, candidaturas: [] }` for closed events. Frontend now checks `Array.isArray(data)` first and falls back to `data.candidaturas`.

3. **valor_proposto field** — Added `valor_proposto?: number` to the `BandApplication` interface, required for Phase 2 negotiation display.

4. **getMyApplications stub** — Added `GET /eventos/minhas` caller so the exported object is complete and callers referencing this method don't fail.

5. **acceptApplication / rejectApplication stubs** — Added `PUT /eventos/:id/aceitar` and `PUT /eventos/:id/recusar` for Phase 3 readiness.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add valor_proposto, fix getApplicationsByEvent, add stubs | 62cc021 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added getMyApplications stub**
- **Found during:** Task 1
- **Issue:** The plan's exported object lists `getMyApplications` but the original file had no such function. Without it, the export statement would be invalid TypeScript.
- **Fix:** Added `getMyApplications` calling `GET /eventos/minhas` (as described in plan context).
- **Files modified:** TocaAqui/http/bandApplicationService.ts
- **Commit:** 62cc021

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| getMyApplications | TocaAqui/http/bandApplicationService.ts | Backend route GET /eventos/minhas not yet mounted in BandApplicationRoutes.ts — Phase 3 will wire full flow |
| acceptApplication | TocaAqui/http/bandApplicationService.ts | Phase 3 will implement accept flow in EstGigApplications screen |
| rejectApplication | TocaAqui/http/bandApplicationService.ts | Phase 3 will implement reject flow in EstGigApplications screen |

## Self-Check: PASSED

- [x] TocaAqui/http/bandApplicationService.ts exists and modified
- [x] Commit 62cc021 exists
- [x] valor_proposto in interface (line 16)
- [x] candidaturas handling in getApplicationsByEvent (lines 34-35)
- [x] aceitar/recusar routes present (lines 46, 51)
- [x] All 5 methods exported
