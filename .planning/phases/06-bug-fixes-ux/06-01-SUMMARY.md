---
phase: 06-bug-fixes-ux
plan: 01
subsystem: frontend
tags: [bug-fix, auth, crash, endpoint]
dependency_graph:
  requires: []
  provides: [bandApplicationService-correct-endpoint, EstGigs-safe-formatBRL, ArtistEPK-logout, EstSettings-logout]
  affects: [artist-application-flow, est-vagas-screen, artist-epk-profile, est-settings-screen]
tech_stack:
  added: []
  patterns: [signOut-useAuth-pattern, Number-before-toFixed-pattern]
key_files:
  created: []
  modified:
    - TocaAqui/http/bandApplicationService.ts
    - TocaAqui/screens/establishment/EstGigs.tsx
    - TocaAqui/screens/artist/ArtistEPK.tsx
    - TocaAqui/screens/establishment/EstSettings.tsx
decisions:
  - applyToEvent fixed from /candidaturas to /eventos — backend mounts BandApplicationRoutes at /eventos not /candidaturas
  - formatBRL uses Number(v) before toFixed to handle string values from backend
  - signOut button uses Alert confirm in EstSettings (consistent with UserSettings), direct call in ArtistEPK
metrics:
  duration_seconds: 103
  completed_date: "2026-04-03"
  tasks_completed: 3
  files_modified: 4
requirements:
  - REQ-20
  - REQ-21
  - REQ-22
---

# Phase 06 Plan 01: Critical Bug Fixes (Endpoint + Crash + Logout) Summary

**One-liner:** Fixed 404 candidatura endpoint, toFixed crash from string values, and missing logout in ArtistEPK/EstSettings.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Corrigir endpoint de candidatura | 408dfdf | TocaAqui/http/bandApplicationService.ts |
| 2 | Corrigir crash v.toFixed em EstGigs | 15b52e2 | TocaAqui/screens/establishment/EstGigs.tsx |
| 3 | Implementar logout ArtistEPK e EstSettings | 4f2401c | TocaAqui/screens/artist/ArtistEPK.tsx, TocaAqui/screens/establishment/EstSettings.tsx |

## What Was Built

**Task 1 — Endpoint fix (bandApplicationService.ts):**
`applyToEvent` was calling `api.post("/candidaturas", data)` but the backend mounts `BandApplicationRoutes` at `/eventos` (not `/candidaturas`). Changed to `api.post("/eventos", data)`. All other endpoints in the service were already correct.

**Task 2 — formatBRL crash fix (EstGigs.tsx):**
`formatBRL(v?: number)` called `v.toFixed(2)` directly, which crashes when the backend returns `cache_minimo` or `cache_maximo` as a string. Replaced with:
```typescript
function formatBRL(v?: number | string) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}
```

**Task 3 — Logout buttons (ArtistEPK.tsx + EstSettings.tsx):**
- ArtistEPK: Added `signOut` from `useAuth()`, `handleSignOut` function, and a "SAIR DA CONTA" button at the bottom of the ScrollView with danger-red styling matching the UserSettings pattern.
- EstSettings: Added `useAuth` import, `FontAwesome5` import, `signOut` from hook, `handleSignOut` with `Alert.alert` confirmation dialog, and "SAIR DA CONTA" button before the Modal with the same danger-red styling.

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- [x] POST para candidatura nao retorna 404 — endpoint agora alinhado com backend `/eventos`
- [x] Abrir lista de vagas em EstGigs nao crasha com toFixed — `Number(v)` protege contra strings
- [x] Perfil artista (ArtistEPK) tem botao Sair que chama signOut()
- [x] EstSettings tem botao Sair que chama signOut()
- [x] UserSettings ja usa signOut() corretamente — sem alteracao necessaria

## Known Stubs

None — all changes are wired to real auth and real data.

## Self-Check: PASSED

Files verified:
- TocaAqui/http/bandApplicationService.ts — contains `api.post("/eventos")` not `/candidaturas`
- TocaAqui/screens/establishment/EstGigs.tsx — contains `Number(v)` in formatBRL
- TocaAqui/screens/artist/ArtistEPK.tsx — contains `signOut` and "SAIR DA CONTA"
- TocaAqui/screens/establishment/EstSettings.tsx — contains `signOut` and "SAIR DA CONTA"

Commits verified: 408dfdf, 15b52e2, 4f2401c
