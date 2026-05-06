---
phase: 03-accept-contract-flow
plan: 01
subsystem: ui
tags: [react-native, typescript, establishment, candidatura, navigation]

# Dependency graph
requires:
  - phase: 02-artist-application-flow
    provides: valor_proposto field on BandApplication, candidatura submitted with value
provides:
  - Candidatura interface with valor_proposto field
  - EstStackParamList.EstAcceptContract with valorProposto param
  - EstGigApplications cards showing proposed value with currency formatting or "A combinar" fallback
  - Navigation to EstAcceptContract passing valorProposto param
affects: [03-02-accept-contract-screen, EstAcceptContract]

# Tech tracking
tech-stack:
  added: []
  patterns: [toLocaleString pt-BR currency formatting, null-coalescing fallback text for optional numeric values]

key-files:
  created: []
  modified:
    - TocaAqui/http/establishmentService.ts
    - TocaAqui/navigation/EstablishmentNavigator.tsx
    - TocaAqui/screens/establishment/EstGigApplications.tsx

key-decisions:
  - "valor_proposto displayed with pt-BR currency format (R$ X,XX) using toLocaleString with minimumFractionDigits: 2"
  - "Null check uses != null (not !) to catch undefined and null, showing 'A combinar' fallback"

patterns-established:
  - "Currency display pattern: Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) prefixed with R$"
  - "Null fallback text pattern: value != null ? formatted : 'A combinar'"

requirements-completed: [REQ-09, REQ-10]

# Metrics
duration: 8min
completed: 2026-04-02
---

# Phase 03 Plan 01: Add valor_proposto to EstGigApplications Cards Summary

**Candidatura interface extended with valor_proposto, EstGigApplications cards now show proposed value with pt-BR currency formatting and navigation passes valorProposto to EstAcceptContract**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-02T00:00:00Z
- **Completed:** 2026-04-02T00:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `valor_proposto?: number` to Candidatura interface, enabling frontend to consume the field from backend responses
- Extended EstStackParamList.EstAcceptContract to include `valorProposto?: number`, enabling type-safe navigation with proposed value
- Each candidate card in EstGigApplications now displays "Proposta: R$ X,XX" or "Proposta: A combinar" when null, styled with DS.cyan for visual prominence

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Candidatura interface and EstStackParamList types** - `5bdf757` (feat)
2. **Task 2: Display valor_proposto in candidate card and pass to navigation** - `4bdaeda` (feat)

## Files Created/Modified
- `TocaAqui/http/establishmentService.ts` - Added `valor_proposto?: number` to Candidatura interface
- `TocaAqui/navigation/EstablishmentNavigator.tsx` - Added `valorProposto?: number` to EstAcceptContract nav params type
- `TocaAqui/screens/establishment/EstGigApplications.tsx` - Added valor_proposto display line, valorLine style, and updated ACEITAR button navigation call

## Decisions Made
- Currency format uses `Number(item.valor_proposto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })` to match Brazilian locale conventions
- Null check uses `!= null` (not `!`) to correctly handle both null and undefined values while allowing `0` to display as currency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- Plan 03-02 (EstAcceptContract screen) can now receive `valorProposto` from navigation params — the param type is already declared in EstStackParamList
- No blockers for 03-02

---
*Phase: 03-accept-contract-flow*
*Completed: 2026-04-02*
