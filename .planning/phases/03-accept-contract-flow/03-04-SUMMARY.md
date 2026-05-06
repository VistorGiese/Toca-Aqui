---
phase: 03-accept-contract-flow
plan: 04
subsystem: ui
tags: [react-native, typescript, contract-flow, navigation, artist]

# Dependency graph
requires:
  - phase: 03-accept-contract-flow/03-02
    provides: "contrato_id exposed in artist applications response from backend"
provides:
  - "BandApplication interface includes contrato_id field"
  - "MyApplications shows VER CONTRATO button for accepted candidaturas with contract"
  - "ContractDetail uses correct field names (cache_total, data_evento)"
  - "Post-sign navigation routes artist to ArtistSchedule tab"
affects: [phase-04, future-contract-screens]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cross-navigator navigation from stack to tab: (navigation as any).navigate('ArtistTabs', { screen: 'Tab' })"
    - "Conditional button render: isAccepted && contrato_id != null"

key-files:
  created: []
  modified:
    - TocaAqui/http/bandApplicationService.ts
    - TocaAqui/screens/artist/MyApplications.tsx
    - TocaAqui/screens/artist/ContractDetail.tsx

key-decisions:
  - "Cast navigation as any for cross-navigator (stack→tab) navigation — TypeScript doesn't resolve nested navigator params without it"
  - "VER CONTRATO button uses DS.accent background to match design system, same style as primary CTAs"

patterns-established:
  - "Cross-navigator navigation: (navigation as any).navigate('RootTabScreen', { screen: 'TabScreen' })"

requirements-completed: [REQ-07, REQ-08]

# Metrics
duration: 10min
completed: 2026-04-02
---

# Phase 03 Plan 04: Artist Contract Flow Summary

**contrato_id wired from BandApplication to VER CONTRATO button navigating ContractDetail, with correct cache_total/data_evento fields and post-sign ArtistSchedule navigation**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-02T10:30:00Z
- **Completed:** 2026-04-02T10:40:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `contrato_id?: number` to `BandApplication` interface — artist applications from backend now carry the contract reference
- `MyApplications` `ApplicationCard` shows a "VER CONTRATO" button for accepted candidaturas that have `contrato_id` — tapping navigates to `ContractDetail` with the contract id
- Fixed `ContractDetail` to use correct field names (`cache_total` instead of `cache_acordado`, `data_evento` instead of `data_show`) — cache amount and date now display real values instead of R$ 0,00 / "Data não informada"
- Post-sign navigation changed from `goBack()` to `navigate("ArtistTabs", { screen: "ArtistSchedule" })` — artist lands on their schedule after confirming a contract

## Task Commits

Each task was committed atomically:

1. **Task 1: Add contrato_id to BandApplication and VER CONTRATO button in MyApplications** - `391b7ca` (feat)
2. **Task 2: Fix ContractDetail field names and post-sign navigation to ArtistSchedule** - `7fcff24` (fix)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `TocaAqui/http/bandApplicationService.ts` - Added `contrato_id?: number` to BandApplication interface
- `TocaAqui/screens/artist/MyApplications.tsx` - ApplicationCard gets `onViewContract` prop; VER CONTRATO button added; renderItem passes navigation callback
- `TocaAqui/screens/artist/ContractDetail.tsx` - Fixed `data_show` → `data_evento`, `cache_acordado` → `cache_total`, `goBack()` → `navigate("ArtistTabs", { screen: "ArtistSchedule" })`

## Decisions Made
- Used `(navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" })` for cross-navigator navigation from stack screen to tab — React Navigation TypeScript types don't resolve nested navigators without full type composition; the cast is idiomatic for this pattern
- VER CONTRATO button placed inline after the statusBadgeAccepted view with `DS.accent` background, matching primary CTA style

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Worktree was on old `worktree-agent-a0d4392c` branch (pre-Phase 2). Reset to `front-test-stitch` via `git reset --hard front-test-stitch` before executing. No plan content affected.

## Known Stubs

None — all fields wired to real data. `contrato_id` comes from backend response, `cache_total` and `data_evento` are real contract fields.

## Next Phase Readiness
- Artist-side contract flow complete: MyApplications → ContractDetail → ArtistSchedule
- REQ-07 (recusado status visible) confirmed from Phase 2 normalization
- REQ-08 (artist views and confirms contract) fully wired end-to-end
- Phase 03 all 4 plans complete — ready for phase transition

## Self-Check

- [x] `TocaAqui/http/bandApplicationService.ts` — confirmed `contrato_id?: number` present
- [x] `TocaAqui/screens/artist/MyApplications.tsx` — confirmed `VER CONTRATO`, `onViewContract`, `ContractDetail` present
- [x] `TocaAqui/screens/artist/ContractDetail.tsx` — confirmed `cache_total`, `data_evento`, `ArtistTabs`, `ArtistSchedule` present; zero occurrences of `cache_acordado` or `data_show`
- [x] Commits `391b7ca` and `7fcff24` verified in git log

## Self-Check: PASSED

---
*Phase: 03-accept-contract-flow*
*Completed: 2026-04-02*
