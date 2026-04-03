---
phase: 06-bug-fixes-ux
plan: "04"
subsystem: establishment-profile
tags: [establishment, edit-profile, navigation, frontend, ux]
dependency_graph:
  requires: [06-01]
  provides: [establishment-edit-profile-screen]
  affects: [EstablishmentNavigator, EstProfile, establishmentService]
tech_stack:
  added: []
  patterns: [chip-picker, useEffect-load-save, navigation-goBack]
key_files:
  created:
    - TocaAqui/screens/establishment/EstEditProfile.tsx
  modified:
    - TocaAqui/http/establishmentService.ts
    - TocaAqui/navigation/EstablishmentNavigator.tsx
    - TocaAqui/screens/establishment/EstProfile.tsx
decisions:
  - "Used existing PUT /estabelecimentos/:id backend route (updateEstablishment controller) rather than creating a new endpoint"
  - "Edit button placed in heroActions alongside settings icon in EstProfile"
  - "Tipo selection uses chip UI pattern consistent with other screens in the design system"
metrics:
  duration: "10 minutes"
  completed_date: "2026-04-03"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
requirements_satisfied: [REQ-26]
---

# Phase 06 Plan 04: EstEditProfile — Tela de Edição do Perfil do Estabelecimento Summary

**One-liner:** EstEditProfile screen created with nome/descricao/tipo/telefone fields, connected via PUT /estabelecimentos/:id to existing backend route.

## What Was Built

Created the missing `EstEditProfile` screen allowing establishment owners to edit their profile name, description, type, and contact phone number. The screen loads current profile data on mount, displays a chip picker for establishment type selection, and saves via the existing backend `PUT /estabelecimentos/:id` route. Connected to `EstablishmentNavigator` stack and accessible via a new edit button in `EstProfile` header.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Verificar rota de update no backend e adicionar updateProfile no service | 546bc84 | TocaAqui/http/establishmentService.ts |
| 2 | Criar EstEditProfile.tsx e conectar ao navigator e EstProfile | 1b048c1 | TocaAqui/screens/establishment/EstEditProfile.tsx, TocaAqui/navigation/EstablishmentNavigator.tsx, TocaAqui/screens/establishment/EstProfile.tsx |

## Verification Results

1. `EstEditProfile.tsx` exists — PASSED
2. `EstablishmentNavigator.tsx` has import + Screen registration (3 references) — PASSED
3. `EstProfile.tsx` has navigate call to EstEditProfile — PASSED
4. `EstEditProfile.tsx` contains `nome_estabelecimento` and `updateMyEstablishmentProfile` — PASSED

## Deviations from Plan

None — plan executed exactly as written. Backend already had `PUT /:id` route via `updateEstablishment` controller, so no new backend route was needed.

## Known Stubs

None — all fields are wired to real API data via `getMyEstablishmentProfile` and `updateMyEstablishmentProfile`.

## Self-Check: PASSED

- `TocaAqui/screens/establishment/EstEditProfile.tsx` — FOUND
- Commit `546bc84` — FOUND
- Commit `1b048c1` — FOUND
