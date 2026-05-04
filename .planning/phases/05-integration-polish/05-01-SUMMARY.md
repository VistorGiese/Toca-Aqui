---
phase: 05-integration-polish
plan: "01"
subsystem: backend-contract + frontend-establishment
tags: [contract, complete-flow, shows_realizados, backend-route, frontend-button]
dependency_graph:
  requires: [04-user-feed]
  provides: [complete-contract-flow, shows_realizados-increment-trigger]
  affects: [EstShowDetail, ContractController, ContractRoutes, contractService]
tech_stack:
  added: []
  patterns: [asyncHandler, authMiddleware, contractService.getUserRole, Redis invalidation, Alert confirmation]
key_files:
  created: []
  modified:
    - backend-TocaAqui/src/controllers/ContractController.ts
    - backend-TocaAqui/src/routes/ContractRoutes.ts
    - TocaAqui/http/contractService.ts
    - TocaAqui/screens/establishment/EstShowDetail.tsx
decisions:
  - "completeContractHandler restricted to contratante role — establishment completes, not artist"
  - "Button shows only for status=aceito, not aguardando_aceite — only fully-confirmed contracts can be completed"
  - "After completeContract, load() reloads data so isConcluido becomes true and AVALIAR ARTISTA button appears automatically"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_modified: 4
---

# Phase 05 Plan 01: Complete Contract Flow — Profile Stats Summary

Wire PUT /contratos/:id/concluir backend route to the existing completeContract service and add "MARCAR COMO REALIZADO" button in EstShowDetail, enabling establishments to mark shows as completed and trigger shows_realizados increment.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add PUT /contratos/:id/concluir backend route and controller | 3628216 | ContractController.ts, ContractRoutes.ts |
| 2 | Add completeContract to frontend service and MARCAR COMO REALIZADO button | b07a46e | contractService.ts, EstShowDetail.tsx |

## What Was Built

**Backend:**
- `completeContractHandler` controller function in `ContractController.ts` — calls `contractService.completeContract()`, restricted to `contratante` role, invalidates Redis cache
- `PUT /:id/concluir` route registered in `ContractRoutes.ts` with `authMiddleware` before the avaliar route

**Frontend:**
- `completeContract(id)` method added to `contractService.ts` calling `api.put(/contratos/${id}/concluir)`
- `contractService` export object updated to include `completeContract`
- `EstShowDetail.tsx`: imported `contractService`, added `completing` state, `handleComplete` handler with Alert confirmation dialog, "MARCAR COMO REALIZADO" button visible when `contract.status === "aceito"`, and `btnComplete`/`btnCompleteText` styles using `DS.success` color

## Flow After Implementation

1. Establishment opens `EstShowDetail` for an accepted (aceito) contract
2. "MARCAR COMO REALIZADO" green button is visible
3. Tapping shows Alert confirmation: "Confirma que este show foi realizado com sucesso?"
4. On confirm: `PUT /contratos/:id/concluir` is called
5. Backend marks contract as `concluido`, increments `shows_realizados` for artist and establishment
6. `load()` reloads contract — status becomes `concluido`
7. "MARCAR COMO REALIZADO" button disappears, "AVALIAR ARTISTA" button appears

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — all data flows are wired. `shows_realizados` is incremented by the existing `completeContract()` service method.

## Self-Check: PASSED

All files verified to exist on disk. Both commits (3628216, b07a46e) confirmed in git log.
