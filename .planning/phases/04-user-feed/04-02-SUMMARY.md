---
phase: 04-user-feed
plan: "02"
subsystem: frontend
tags: [react-native, navigation, conditional-rendering, bugfix]
dependency_graph:
  requires: []
  provides: [UserShowDetail-conditional-artist-section]
  affects: [UserFeed, UserArtistProfile]
tech_stack:
  added: []
  patterns: [optional-chaining, null-guard, conditional-render]
key_files:
  created: []
  modified:
    - TocaAqui/screens/user/UserShowDetail.tsx
decisions:
  - confirmedBand null-check is the single source of truth for artist availability — avoids dual state and keeps rendering logic in one place
  - View instead of TouchableOpacity for unconfirmed state — semantic difference prevents accidental interaction
metrics:
  duration: "2 minutes"
  completed: "2026-04-02T16:34:00Z"
  tasks_completed: 1
  files_modified: 1
---

# Phase 04 Plan 02: UserShowDetail Conditional Artist Section Summary

**One-liner:** Replaced hardcoded `artistId ?? 1` fallback with null-safe `confirmedBand` derivation and conditional rendering — shows "Artista a ser confirmado" for unbooked events.

## What Was Done

Fixed `UserShowDetail.tsx` to correctly handle shows without an accepted contract:

- Derived `confirmedBand = show.Contract?.Band ?? null` as the single source of truth for whether an artist is confirmed
- Set `artistId = confirmedBand?.id ?? null` — eliminates the invalid `?? 1` fallback that caused navigation to a non-existent artist profile
- Added guard `if (!artistId) return` in `goToArtist()` — prevents any navigation when no real artist is linked
- Replaced unconditional `<TouchableOpacity>` artist card with conditional branch:
  - When `confirmedBand` exists: renders purple avatar + `nome_banda` + `generos_musicais` + "ver perfil completo" button (all interactive)
  - When `confirmedBand` is null: renders grey avatar + "Artista a ser confirmado" text as non-interactive `<View>` (no button, no press handler)
- Removed unused `artistName` derived variable

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Conditional artist section + navigation guard | 269ff4f | TocaAqui/screens/user/UserShowDetail.tsx |

## Verification

- Zero TypeScript errors in `UserShowDetail.tsx` (confirmed via `tsc --noEmit`, pre-existing errors in other files are out of scope)
- `artistId` is `null` when `show.Contract?.Band` is undefined/null — fallback `1` removed
- `goToArtist` has guard `if (!artistId) return` — never navigates for invalid artistId
- Without confirmed band: card shows "Artista a ser confirmado" as non-interactive `<View>`
- With confirmed band: card shows `nome_banda`, genres, and active "ver perfil completo" button
- `show.titulo_evento` unchanged in cover title (not affected by artist changes)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — no hardcoded empty values or placeholder text introduced.

## Self-Check: PASSED

- File exists: `/c/Users/vitor/Documents/Dev/TCC - Toca Aqui/Toca-Aqui/.claude/worktrees/agent-a80cfbda/TocaAqui/screens/user/UserShowDetail.tsx` — FOUND
- Commit 269ff4f exists in git history — FOUND
