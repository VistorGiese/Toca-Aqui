---
phase: 03-accept-contract-flow
plan: 02
subsystem: backend
tags: [contract, band-application, accept-flow, status, cache]
dependency_graph:
  requires: [03-01]
  provides: [correct-contract-status, contrato-in-accept-response, contrato_id-in-artist-applications]
  affects: [03-03, 03-04]
tech_stack:
  added: []
  patterns: [service-returns-composite-object, async-map-for-contrato_id]
key_files:
  created: []
  modified:
    - backend-TocaAqui/src/services/ContractService.ts
    - backend-TocaAqui/src/services/BandApplicationService.ts
    - backend-TocaAqui/src/controllers/BandApplicationController.ts
decisions:
  - "Contract generated from application now uses AGUARDANDO_ACEITE status and valor_proposto as cache seed"
  - "BandApplicationService.accept() returns composite object { aplicacao, contrato } to expose contrato.id upstream"
  - "getApplicationsByArtist uses async Promise.all map to query contrato_id for accepted applications (N+1 acceptable at TCC demo scale)"
  - "acceptContract guard changed from <= 0 to < 0 to allow zero-cache contracts when valor_proposto was null"
metrics:
  duration: "8 minutes"
  completed: "2026-04-02T10:16:08Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 03 Plan 02: accept-reject-logic Summary

**One-liner:** Backend accept chain returns `{ aplicacao, contrato }` with contract status `aguardando_aceite` and cache seeded from `valor_proposto`, enabling frontend navigation and artist signature.

## What Was Built

Fixed three backend bugs that blocked the accept-contract flow:

1. **ContractService.generateFromApplication** — contract was created with `status: RASCUNHO` and `cache_total: 0`. Now created with `status: AGUARDANDO_ACEITE` and `cache_total: aplicacao.valor_proposto ?? 0`, with `valor_sinal` seeded at 50% of that value.

2. **BandApplicationService.accept()** — was discarding the generated `contrato` and returning only `aplicacao`. Now returns `{ aplicacao, contrato }` so the controller (and frontend) can access `contrato.id`.

3. **BandApplicationController.acceptBandApplication** — was ignoring the contrato. Now destructures `{ aplicacao, contrato }` from `accept()` and includes `contrato` in the JSON response. Frontend can use `contrato.id` to navigate to EstShowDetail.

4. **BandApplicationService.getApplicationsByArtist** — artist's applications map was missing `contrato_id`. Now uses `Promise.all` async map: for each `aceito` application it queries `ContractModel.findOne({ where: { aplicacao_id } })` and includes `contrato_id`. Artist's MyApplications screen can navigate to ContractDetail using this field.

5. **ContractService.acceptContract guard** — relaxed from `cache_total <= 0` to `cache_total < 0`. This unblocks artist signature when `valor_proposto` was null (cache_total = 0 is valid).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 5b66678 | fix(03-02): contract status AGUARDANDO_ACEITE, cache from valor_proposto, relax guard |
| Task 2 | c39ef79 | feat(03-02): accept() returns contrato, controller includes it, add contrato_id to artist applications |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data flows are wired. Contract status and cache values come from real application data.

## Self-Check: PASSED

- `backend-TocaAqui/src/services/ContractService.ts` — modified, contains `AGUARDANDO_ACEITE` at line 87, `valor_proposto ?? 0` at line 103, guard `< 0` at line 274
- `backend-TocaAqui/src/services/BandApplicationService.ts` — modified, contains `return { aplicacao, contrato }` at line 214, `contrato_id` at lines 319/322/336
- `backend-TocaAqui/src/controllers/BandApplicationController.ts` — modified, contains `const { aplicacao, contrato }` at line 19
- TypeScript compilation: `npx tsc --noEmit` passed with no errors
- Commits 5b66678 and c39ef79 confirmed in git log
