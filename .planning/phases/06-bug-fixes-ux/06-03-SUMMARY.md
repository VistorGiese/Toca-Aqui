---
phase: 06-bug-fixes-ux
plan: "03"
subsystem: frontend-establishment-artist
tags: [bug-fix, ux, schedule, profile-edit, artist]
dependency_graph:
  requires: [06-01]
  provides: [EstSchedule-real-data, ArtistProfileEdit-artist-fields]
  affects: [EstSchedule, ArtistProfileEdit, UserController, UserRoutes]
tech_stack:
  added: []
  patterns: [defensive-normalization, patch-endpoint, chip-selector]
key_files:
  created: []
  modified:
    - TocaAqui/screens/establishment/EstSchedule.tsx
    - TocaAqui/screens/artist/ArtistProfileEdit.tsx
    - backend-TocaAqui/src/controllers/UserController.ts
    - backend-TocaAqui/src/routes/UserRoutes.ts
decisions:
  - Contract response normalization maps data_evento->data_show and cache_total->cache_acordado at load time
  - New PATCH /usuarios/perfil-artista/:id route added before specific sub-routes to avoid conflict
  - ArtistProfileEdit uses api.get directly for profile load due to mismatch in artistaPublicoService response key (artista vs perfil)
  - generos stored as array in ArtistProfileModel, sent as array in PATCH body
metrics:
  duration: "10 minutes"
  completed: "2026-04-03"
  tasks: 2
  files_modified: 4
---

# Phase 6 Plan 3: EstSchedule Fix & ArtistProfileEdit Rewrite Summary

One-liner: Fixed EstSchedule empty agenda via field normalization (data_evento→data_show, cache_total→cache_acordado) and rewrote ArtistProfileEdit to edit artist profile fields (nome_artistico, biografia, generos, cache_minimo) with new PATCH backend route.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Diagnosticar e corrigir EstSchedule agenda vazia | 783f7b6 | EstSchedule.tsx |
| 2 | Reescrever ArtistProfileEdit para editar perfil artista real | e37c34b | ArtistProfileEdit.tsx, UserController.ts, UserRoutes.ts |

## What Was Built

### Task 1: EstSchedule Contract Field Normalization

The agenda was empty because EstSchedule expected flat fields (`data_show`, `cache_acordado`, `nome_artista`, `nome_evento`) that don't exist in the contract model. The backend `ContractModel` uses:
- `data_evento` (not `data_show`)
- `cache_total` (not `cache_acordado`)
- `nome_contratado` (not `nome_artista`)
- No `nome_evento` — uses `local_evento` as fallback

Added defensive normalization in the `load()` callback that maps backend fields to the expected names, with fallbacks for nested associations (`Event`, `ArtistProfile`, `Band`).

### Task 2: ArtistProfileEdit Rewrite + Backend Route

The old screen edited `nome_completo` and `email` of the user — completely wrong for artist profile editing. Rewrote it to:

1. **Load** artist profile via `GET /artistas/:id/publico` (handles both `perfil` and `artista` response keys)
2. **Edit fields**: nome_artistico, biografia, generos (chip selector), cache_minimo (numeric input)
3. **Save** via new `PATCH /usuarios/perfil-artista/:id` backend route with ownership check
4. **Design**: consistent dark DS with accent #7B61FF, Montserrat fonts, back button

Added to backend:
- `atualizarPerfilArtista` controller in `UserController.ts` — validates ownership, accepts `nome_artistico`, `biografia`, `generos`, `cache_minimo`, `cache_maximo`
- Route `PATCH /usuarios/perfil-artista/:id` in `UserRoutes.ts` — placed before photo/press-kit routes

## Deviations from Plan

### Auto-added Missing Critical Functionality

**1. [Rule 2 - Missing Backend Route] Added PATCH /usuarios/perfil-artista/:id route**
- **Found during:** Task 2 — UserRoutes.ts had no general update endpoint for artist profile
- **Issue:** Plan referenced `PATCH /usuarios/perfil-artista/:id` but the route didn't exist
- **Fix:** Added `atualizarPerfilArtista` handler and registered the route before specific sub-routes
- **Files modified:** UserController.ts, UserRoutes.ts
- **Commit:** e37c34b

**2. [Rule 1 - Bug] Fixed artistaPublicoService response key mismatch**
- **Found during:** Task 2 — frontend service reads `response.data.artista` but backend returns `response.data.perfil`
- **Fix:** Used `api.get` directly in ArtistProfileEdit with fallback: `r.data?.perfil ?? r.data?.artista ?? r.data`
- **Files modified:** ArtistProfileEdit.tsx
- **Commit:** e37c34b

## Known Stubs

None — both features are fully wired to real backend endpoints.

## Self-Check: PASSED

- [x] EstSchedule.tsx normalization exists (grep confirms `normalized`, `data_evento`, `cache_total`)
- [x] ArtistProfileEdit.tsx has `nome_artistico`, `perfilArtistaId`, `perfil-artista` references
- [x] Backend route PATCH /usuarios/perfil-artista/:id registered in UserRoutes.ts
- [x] Both commits exist: 783f7b6, e37c34b
