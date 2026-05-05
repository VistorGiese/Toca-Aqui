---
phase: 02-artist-application-flow
plan: 01
subsystem: browse-events
tags: [backend, frontend, booking, filter, establishment]
dependency_graph:
  requires: []
  provides: [server-side-pendente-filter, nome_estabelecimento-in-cards]
  affects: [BrowseEvents, BookingController, bookingService]
tech_stack:
  added: []
  patterns: [sequelize-include-join, server-side-filter, response-mapping]
key_files:
  created: []
  modified:
    - backend-TocaAqui/src/controllers/BookingController.ts
    - TocaAqui/http/bookingService.ts
    - TocaAqui/screens/artist/BrowseEvents.tsx
decisions:
  - Server-side status filter preferred over client-side for correctness and scalability
  - nome_estabelecimento flattened to top-level booking object via toJSON() + spread
metrics:
  duration: ~5min
  completed: 2026-04-01T23:02:00Z
  tasks_completed: 2
  files_modified: 3
---

# Phase 02 Plan 01: Browse Events Filter Summary

**One-liner:** Server-side `pendente` filter via JOIN with EstablishmentProfile — BrowseEvents now shows real establishment names instead of `Estab. #ID`.

## What Was Done

Resolved two linked bugs in the artist Browse Events screen: the status filter was running client-side (meaning all bookings were fetched and filtered in JS), and the establishment name was showing a numeric placeholder (`Estab. #${booking.estabelecimento_id}`) instead of the real name.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add EstablishmentProfile JOIN to BookingController.getBookings | ac97e43 | `backend-TocaAqui/src/controllers/BookingController.ts` |
| 2 | Update bookingService + BrowseEvents for server-side filter and real name display | 38461a8 | `TocaAqui/http/bookingService.ts`, `TocaAqui/screens/artist/BrowseEvents.tsx` |

## Changes Made

### Backend: BookingController.ts
- Added `include: [{ model: EstablishmentProfileModel, as: 'EstablishmentProfile', attributes: ['id', 'nome_estabelecimento'] }]` to `BookingModel.findAndCountAll`
- Added `mappedRows` that spreads each row's JSON and flattens `nome_estabelecimento` to top level
- Payload uses `mappedRows` instead of raw `rows` — cached response now includes establishment name

### Frontend: bookingService.ts
- Added `nome_estabelecimento?: string` to `Booking` interface
- Updated `getBookings` signature to accept `params?: { status?: string }`
- API call now passes `{ params }` to `api.get` — enables query string forwarding

### Frontend: BrowseEvents.tsx
- Changed `bookingService.getBookings()` to `bookingService.getBookings({ status: 'pendente' })` — server handles filter
- Removed client-side `b.status === "pendente"` check from `filteredBookings.filter()`
- Replaced `Estab. #${booking.estabelecimento_id}` with `booking.nome_estabelecimento ?? "Local não informado"`

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - `nome_estabelecimento` is wired to real backend JOIN data. `"Local não informado"` fallback only appears when `EstablishmentProfile` relation is null, which is correct behavior.

## Verification

Acceptance criteria verified:
- `BookingController.ts` contains `include: [{ model: EstablishmentProfileModel, as: 'EstablishmentProfile'` — YES (ac97e43)
- `BookingController.ts` contains `nome_estabelecimento: row.EstablishmentProfile?.nome_estabelecimento` — YES
- `BookingController.ts` contains `mappedRows` in payload construction — YES
- `bookingService.ts` contains `nome_estabelecimento?: string` in Booking interface — YES
- `bookingService.ts` contains `params?: { status?: string }` in getBookings signature — YES
- `bookingService.ts` contains `{ params }` in api.get call — YES
- `BrowseEvents.tsx` contains `getBookings({ status: 'pendente' })` — YES
- `BrowseEvents.tsx` contains `nome_estabelecimento` for card display — YES
- `BrowseEvents.tsx` does NOT contain client-side filter `b.status === "pendente"` — CONFIRMED REMOVED

## Self-Check: PASSED
