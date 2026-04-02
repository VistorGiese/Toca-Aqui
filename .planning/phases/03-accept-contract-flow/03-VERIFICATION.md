---
phase: 03-accept-contract-flow
verified: 2026-04-02T11:00:00Z
status: gaps_found
score: 7/8 must-haves verified
gaps:
  - truth: "Artist receives notification/feedback when candidatura is accepted or rejected (REQ-07)"
    status: partial
    reason: "MyApplications shows status change (aceito/recusado) as implicit feedback. Backend sends APLICACAO_ACEITA, APLICACAO_REJEITADA, CONTRATO_GERADO notifications correctly. However, the screen artists navigate to for notifications (UserNotifications, accessed from ArtistHome bell and ArtistProfileEdit) is a static stub — it never fetches notifications and hardcodes 'Nenhuma notificação por enquanto.'"
    artifacts:
      - path: "TocaAqui/screens/user/UserNotifications.tsx"
        issue: "Stub — no API call, hardcoded empty state, no useState/useEffect for data fetching"
    missing:
      - "UserNotifications must fetch notifications from the API (e.g., /notificacoes or a shared endpoint) and render them"
      - "Alternatively, create a dedicated ArtistNotifications screen that calls the notification endpoint and wire it in ArtistNavigator"
human_verification:
  - test: "EstAcceptContract: accept a candidatura and verify navigation to EstShowDetail"
    expected: "Alert shows 'Candidatura aceita!', tapping OK lands on EstShowDetail with contract data (non-zero cache, correct date)"
    why_human: "Full accept flow requires auth token, seeded DB with candidatura, cannot run without live server"
  - test: "MyApplications: verify VER CONTRATO button appears on accepted application"
    expected: "Accepted candidatura card shows ACEITA badge AND a 'VER CONTRATO' button. Tapping opens ContractDetail with real cache value"
    why_human: "Requires live backend returning contrato_id in the applications response"
  - test: "ContractDetail: sign contract and verify ArtistSchedule navigation"
    expected: "After tapping ASSINAR E CONFIRMAR, alert shows 'Abrindo sua agenda...', tapping OK lands on ArtistSchedule tab"
    why_human: "Requires auth session with an accepted contract in DB"
---

# Phase 03: Accept & Contract Flow — Verification Report

**Phase Goal:** Estabelecimento vê candidaturas com valores propostos, aceita uma, sistema recusa as demais automaticamente, contrato é gerado e artista pode confirmar.
**Verified:** 2026-04-02T11:00:00Z
**Status:** gaps_found — 1 partial gap (REQ-07 notification screen is a stub)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Establishment sees candidaturas with valor_proposto in each card | VERIFIED | `EstGigApplications.tsx` line 58-62: valorLine renders `item.valor_proposto` with pt-BR currency or "A combinar" fallback |
| 2 | Establishment can accept one candidatura | VERIFIED | `EstAcceptContract.tsx` handleAccept calls `establishmentService.acceptApplication(applicationId)` and navigates to `EstShowDetail` with `contractId` from `response.contrato.id` |
| 3 | System auto-rejects all other candidaturas when one is accepted | VERIFIED | `BandApplicationService.ts` lines 120-123: bulk `UPDATE` sets status='rejeitado' for all other pendente candidaturas in same evento_id |
| 4 | Contract is generated with status aguardando_aceite on accept | VERIFIED | `ContractService.ts` line 87: `status: ContractStatus.AGUARDANDO_ACEITE`; `cache_total` seeded from `aplicacao.valor_proposto ?? 0` |
| 5 | Artist receives notification/feedback for accepted or rejected candidatura | PARTIAL | Backend sends APLICACAO_ACEITA, APLICACAO_REJEITADA, CONTRATO_GERADO notifications (BandApplicationService lines 151-187). MyApplications shows status badges. BUT `UserNotifications.tsx` (linked from ArtistHome bell) is a static stub — never fetches notifications |
| 6 | Artist can view generated contract in ContractDetail | VERIFIED | `MyApplications.tsx` shows VER CONTRATO button for `isAccepted && contrato_id != null`, navigates to `ContractDetail` with `contractId` |
| 7 | ContractDetail shows correct cache and date | VERIFIED | `ContractDetail.tsx` line 228: `contract.cache_total`; line 138: `contract.data_evento` — both correct field names, zero occurrences of old `cache_acordado` or `data_show` |
| 8 | After signing, artist is navigated to ArtistSchedule | VERIFIED | `ContractDetail.tsx` line 78: `(navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" })` |

**Score:** 7/8 truths verified (1 partial)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `TocaAqui/http/establishmentService.ts` | Candidatura interface with valor_proposto | VERIFIED | Line 35: `valor_proposto?: number` present in Candidatura interface |
| `TocaAqui/navigation/EstablishmentNavigator.tsx` | EstAcceptContract params with valorProposto | VERIFIED | Line 41: `valorProposto?: number` in EstStackParamList.EstAcceptContract |
| `TocaAqui/screens/establishment/EstGigApplications.tsx` | valor_proposto display in candidate card | VERIFIED | Lines 58-62: renders valor_proposto or "A combinar"; style `valorLine` with `color: DS.cyan` at line 129 |
| `backend-TocaAqui/src/services/BandApplicationService.ts` | accept() returning `{ aplicacao, contrato }` and getApplicationsByArtist with contrato_id | VERIFIED | Line 214: `return { aplicacao, contrato }`; lines 318-338: async Promise.all map includes `contrato_id` |
| `backend-TocaAqui/src/controllers/BandApplicationController.ts` | Controller returning contrato in response | VERIFIED | Lines 19-25: destructures `{ aplicacao, contrato }`, includes both in JSON response |
| `backend-TocaAqui/src/services/ContractService.ts` | AGUARDANDO_ACEITE status and valor_proposto as cache_total | VERIFIED | Line 87: `ContractStatus.AGUARDANDO_ACEITE`; line 103: `cache_total: aplicacao.valor_proposto ?? 0`; line 274: guard uses `< 0` (not `<= 0`) |
| `TocaAqui/screens/establishment/EstAcceptContract.tsx` | Valor display and post-accept navigation to EstShowDetail | VERIFIED | Lines 25: destructures valorProposto; lines 133-140: VALOR PROPOSTO card; lines 40-55: captures `response.contrato.id`, navigates to EstShowDetail |
| `TocaAqui/screens/establishment/EstShowDetail.tsx` | Correct field references for cache_total and data_evento | VERIFIED | Line 108: `contract.data_evento`; line 112: `contract.cache_total`; line 89: `contract.data_evento` in handleRateArtist; zero occurrences of `cache_acordado` or `data_show` |
| `TocaAqui/http/bandApplicationService.ts` | BandApplication interface with contrato_id | VERIFIED | Line 20: `contrato_id?: number` |
| `TocaAqui/screens/artist/MyApplications.tsx` | VER CONTRATO button for accepted applications | VERIFIED | Lines 221-237: VER CONTRATO button conditional on `isAccepted && contrato_id != null`; renderItem passes `onViewContract` callback to ContractDetail |
| `TocaAqui/screens/artist/ContractDetail.tsx` | Correct field names and post-sign navigation to ArtistSchedule | VERIFIED | Lines 228, 138: correct field names; line 78: ArtistTabs/ArtistSchedule navigation |
| `TocaAqui/screens/user/UserNotifications.tsx` | Artist notification screen (linked from ArtistHome) | STUB | Static component — no API call, always shows hardcoded "Nenhuma notificação por enquanto." |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| EstGigApplications.tsx | establishmentService.ts | `item.valor_proposto` rendered from Candidatura | WIRED | Line 59: `item.valor_proposto != null` check; valorLine style renders it |
| EstGigApplications.tsx | EstAcceptContract | navigate passes `valorProposto: item.valor_proposto` | WIRED | Line 67: navigation.navigate includes `valorProposto: item.valor_proposto` |
| EstAcceptContract.tsx | establishmentService.ts | acceptApplication response includes contrato.id | WIRED | Line 40-41: `const response = await ...; const contractId = response?.contrato?.id` |
| EstAcceptContract.tsx | EstShowDetail | navigate with contractId from response | WIRED | Line 49: `navigation.navigate("EstShowDetail", { contractId })` |
| EstShowDetail.tsx | contract data | uses cache_total and data_evento fields | WIRED | Lines 108, 112: both correct field names used in rendering |
| BandApplicationController.ts | BandApplicationService.ts | destructures { aplicacao, contrato } from accept() | WIRED | Line 19: `const { aplicacao, contrato } = await bandApplicationService.accept(id)` |
| BandApplicationService.ts | ContractService.ts | generateFromApplication uses AGUARDANDO_ACEITE and valor_proposto | WIRED | Line 126: `const contrato = await contractService.generateFromApplication(aplicacao.id)` |
| MyApplications.tsx | ContractDetail | navigation.navigate with contrato_id from application | WIRED | Line 128: `navigation.navigate("ContractDetail", { contractId })` |
| ContractDetail.tsx | ArtistTabs/ArtistSchedule | post-sign navigation to tab screen | WIRED | Line 78: `(navigation as any).navigate("ArtistTabs", { screen: "ArtistSchedule" })` |
| ContractDetail.tsx | contractService.acceptContract | handleAssinar calls acceptContract | WIRED | Line 72: `await contractService.acceptContract(contractId)` |
| ArtistHome.tsx | UserNotifications | bell icon navigates to notification screen | WIRED | Navigation exists, but UserNotifications is a stub |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| EstGigApplications.tsx | `candidates` (Candidatura[]) | `establishmentService.getGigApplications(gigId)` → `GET /eventos/:eventoId` | Yes — DB query in `BandApplicationService.getApplicationsForEvent` | FLOWING |
| EstAcceptContract.tsx | `valorProposto` | Route param from EstGigApplications navigation | Yes — comes from candidate card data | FLOWING |
| EstShowDetail.tsx | `contract` | `establishmentService.getContractById(contractId)` → `GET /contratos/:id` | Yes — ContractService.getById queries ContractModel with includes | FLOWING |
| ContractDetail.tsx | `contract` | `contractService.getContractById(contractId)` → `GET /contratos/:id` | Yes — same endpoint, cache_total and data_evento populated at creation | FLOWING |
| MyApplications.tsx | `applications` (BandApplication[]) | `bandApplicationService.getMyApplications()` → `GET /eventos/minhas` | Yes — BandApplicationService.getApplicationsByArtist with Promise.all for contrato_id | FLOWING |
| UserNotifications.tsx | notifications | (none) | No — static component, never fetches | DISCONNECTED |

---

## Behavioral Spot-Checks

Step 7b: SKIPPED — requires running server and authenticated sessions for all meaningful checks. No standalone CLI entry points available.

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REQ-07 | 03-04 | Artista recebe notificação/feedback quando candidatura é aceita ou recusada | PARTIAL | Backend notifications wired; MyApplications status badges work; UserNotifications screen is a stub |
| REQ-08 | 03-04 | Artista pode visualizar o contrato gerado (ContractDetail) e confirmar aceite | VERIFIED | VER CONTRATO button → ContractDetail → acceptContract → ArtistSchedule chain fully wired |
| REQ-09 | 03-01 | Estabelecimento pode criar um evento (EstNewGig) | VERIFIED | EstNewGig.tsx calls `establishmentService.createGig()`, screen is substantive with form inputs |
| REQ-10 | 03-01 | Estabelecimento vê candidaturas com valor_proposto (EstGigApplications) | VERIFIED | valorLine display in candidate cards with currency formatting and "A combinar" fallback |
| REQ-11 | 03-02, 03-03 | Estabelecimento pode aceitar uma candidatura | VERIFIED | EstAcceptContract.tsx → acceptApplication → auto-reject others → contract creation chain |
| REQ-12 | 03-02 | Auto-recusa das demais candidaturas ao aceitar | VERIFIED | BandApplicationService.accept() line 120-123: bulk UPDATE to 'rejeitado' for other pendente candidaturas |
| REQ-13 | 03-02 | Contrato gerado com status aguardando_aceite | VERIFIED | ContractService.generateFromApplication line 87: AGUARDANDO_ACEITE, line 103: cache from valor_proposto |
| REQ-14 | 03-03 | Estabelecimento vê EstShowDetail após artista assinar | VERIFIED | EstShowDetail uses correct field names (cache_total, data_evento, nome_contratado); navigated to with contractId |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `TocaAqui/screens/user/UserNotifications.tsx` | 19-23 | Stub: no data fetching, hardcoded empty state | BLOCKER (for REQ-07) | Artist notification screen linked from ArtistHome bell and ArtistProfileEdit never shows real notifications |

No other anti-patterns found in the 10 phase files. No `TODO`/`FIXME` comments, no `return null` stubs, no hardcoded empty arrays in active render paths.

---

## Human Verification Required

### 1. Accept Flow — Establishment to EstShowDetail

**Test:** Log in as establishment. Open an event with pending candidaturas. Tap ACEITAR on one. Confirm in the alert. Tap OK on the success alert.
**Expected:** Lands on EstShowDetail showing the event name, a non-zero cache value (R$ X,XX), and the correct date. Other candidaturas should now show status "rejeitado" when re-opening EstGigApplications.
**Why human:** Requires live backend, auth token, and seeded DB data.

### 2. Artist Contract Sign Flow

**Test:** Log in as artist whose candidatura was accepted. Open MyApplications → Aceitas tab. Verify a VER CONTRATO button appears. Tap it. In ContractDetail, tap ASSINAR E CONFIRMAR → Assinar. Tap OK on the success alert.
**Expected:** Lands on ArtistSchedule tab with the signed show visible in the calendar/contract list.
**Why human:** Requires live backend with `contrato_id` in the artist applications response.

### 3. REQ-07 — Notification Feedback Quality

**Test:** After an establishment accepts or rejects a candidatura, open the artist's notification bell (ArtistHome top-right bell icon).
**Expected:** Either (a) real notifications are displayed or (b) the MyApplications screen is confirmed as the intended feedback mechanism.
**Why human:** UserNotifications.tsx is a confirmed stub. The question is whether status badge feedback in MyApplications satisfies the TCC demo requirement, or if the notification screen must be fixed.

---

## Gaps Summary

One gap blocks full REQ-07 satisfaction:

**UserNotifications.tsx is a stub.** The artist notification screen (`TocaAqui/screens/user/UserNotifications.tsx`) — navigated to from both `ArtistHome` (bell icon, line 85) and `ArtistProfileEdit` (line 207) — never fetches data. It always renders "Nenhuma notificação por enquanto." with no API call.

The backend is correctly wired: `BandApplicationService.accept()` and `reject()` both call `createNotification()` with `APLICACAO_ACEITA`, `APLICACAO_REJEITADA`, and `CONTRATO_GERADO` types. The establishment-side notification screen (`EstNotifications.tsx`) is a working implementation that calls `establishmentService.getNotifications()`.

The partial satisfaction of REQ-07 comes from `MyApplications.tsx` correctly showing status badges (ACEITA / RECUSADA) when the artist browses their candidaturas. For the TCC demo this may be sufficient as implicit feedback, but the notification bell link is broken (shows hardcoded empty state).

**Root cause:** `UserNotifications.tsx` was not in scope for any phase 03 plan. Plans 03-04 addressed REQ-07 via the `recusado` status badge in MyApplications, treating notification screen as out-of-scope. The artifact was incorrectly assumed to be a functioning shared screen.

---

_Verified: 2026-04-02T11:00:00Z_
_Verifier: Claude (gsd-verifier)_
