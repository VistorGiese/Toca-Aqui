---
phase: 03-accept-contract-flow
plan: "03"
subsystem: frontend-establishment
tags: [accept-contract, navigation, field-fix, EstAcceptContract, EstShowDetail]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [accept-to-show-detail-flow, correct-contract-data-display]
  affects: [EstAcceptContract, EstShowDetail]
tech_stack:
  added: []
  patterns: [post-accept-navigation, field-name-correctness]
key_files:
  created: []
  modified:
    - TocaAqui/screens/establishment/EstAcceptContract.tsx
    - TocaAqui/screens/establishment/EstShowDetail.tsx
decisions:
  - EstAcceptContract navigates to EstShowDetail with contractId from acceptApplication response; goBack only as fallback when contractId is missing
  - EstShowDetail field names corrected to match Contract interface: cache_total, data_evento, nome_contratado
metrics:
  duration: "1 minute"
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_modified: 2
---

# Phase 03 Plan 03: Accept Contract Navigation and Field Fix Summary

Wire EstAcceptContract post-accept navigation to EstShowDetail using contrato.id from API response, and fix three wrong field names in EstShowDetail (cache_acordado, data_show, nome_responsavel).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add valor_proposto display and post-accept navigation in EstAcceptContract | dc8e54c | EstAcceptContract.tsx |
| 2 | Fix field name mismatches in EstShowDetail | 2c9e666 | EstShowDetail.tsx |

## What Was Built

**Task 1 — EstAcceptContract.tsx:**
- Destructured `valorProposto` from route params (already typed in EstStackParamList from plan 03-01)
- Added VALOR PROPOSTO info row inside the infoCard with pt-BR currency format (`toLocaleString`) and "A combinar" fallback when null/undefined
- Captured `response.contrato.id` from `acceptApplication()` return value (made available by plan 03-02)
- Alert success now navigates to `EstShowDetail` with `{ contractId }` on OK press; `navigation.goBack()` used only as fallback when contractId is missing

**Task 2 — EstShowDetail.tsx:**
- Replaced `contract.data_show` with `contract.data_evento` in 3 places: `handleRateArtist` showDate, `formattedDate` condition, and `new Date()` call
- Replaced `contract.cache_acordado` with `contract.cache_total` in the cache display calculation
- Replaced `contract.nome_responsavel` fallback with `contract.nome_contratado` for artist name display (matches field set during generateFromApplication)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all fields now reference correct Contract interface field names. Data flows from real API response to display.

## Self-Check: PASSED

- FOUND: TocaAqui/screens/establishment/EstAcceptContract.tsx
- FOUND: TocaAqui/screens/establishment/EstShowDetail.tsx
- FOUND commit dc8e54c: feat(03-03): add valor_proposto display and post-accept navigation in EstAcceptContract
- FOUND commit 2c9e666: fix(03-03): fix field name mismatches in EstShowDetail
