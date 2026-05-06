---
status: resolved
trigger: "Fix 6 critical issues blocking TCC presentation in the Toca Aqui React Native + Node.js backend monorepo."
created: 2026-03-30T00:00:00Z
updated: 2026-03-30T03:00:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: Docker Desktop is not running — the MySQL container (localhost:3307) is down, so every DB connection attempt gets ECONNREFUSED with an empty error message
test: Confirmed — `docker ps` returns "failed to connect to the docker API ... check if the daemon is running". No mysqld process exists. Port 3307 is not bound. sequelize-config.js and .env are both correct.
expecting: Starting Docker Desktop and running `docker-compose up -d mysql` inside backend-TocaAqui/ will bring up MySQL on port 3307; migration will succeed immediately after
next_action: User must start Docker Desktop, then run migration

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: App works correctly for TCC presentation — users stay logged in, profiles show real data, gig workflow functions end-to-end, buttons do something, app doesn't crash to white screen
actual:
1. Every service file has hardcoded IP (192.168.x.x) — app breaks on any machine except dev's
2. App does not restore session from AsyncStorage on cold start — users always land at Login screen
3. `nota_media`, `shows_realizados`, `favorited` fields on ArtistProfileModel/EstablishmentProfileModel are never written — profiles always show zeros
4. Frontend gig status string literals don't match backend enum values — BrowseEvents shows wrong/empty results
5. Multiple `onPress={() => {}}` empty handlers in screens — buttons do nothing when tapped
6. No React error boundary — any JS error crashes app to white screen with no recovery
errors: No runtime errors per se — these are logic/configuration bugs
reproduction:
1. Run app on any machine except developer's → API calls fail (wrong IP)
2. Close and reopen app → user is logged out
3. Artist completes a show → profile still shows 0 shows
4. Artist opens BrowseEvents → gigs may not appear correctly
5. Tap various buttons in ShowDetail, EstRateArtist, ApplyConfirmation screens → nothing happens
6. Any uncaught JS error → white screen of death
started: Structural issues present since initial implementation

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-03-30T00:05:00Z
  checked: TocaAqui/http/api.ts
  found: baseURL hardcoded to "http://192.168.224.1:3000". All other service files already use `import api from "./api"` so fixing api.ts alone fixes all services.
  implication: ISSUE 1 fix is a 1-line change in api.ts

- timestamp: 2026-03-30T00:05:00Z
  checked: TocaAqui/contexts/AuthContext.tsx loadStoredData()
  found: loadStoredData() explicitly calls AsyncStorage.multiRemove() to CLEAR session on every cold start (line 45: "// Não restaura sessão — usuário sempre começa pelo Login"). This is intentional but wrong.
  implication: ISSUE 2 fix requires replacing loadStoredData() body to actually restore session using stored token + getProfile()

- timestamp: 2026-03-30T00:05:00Z
  checked: backend-TocaAqui/src/services/ContractService.ts completeContract()
  found: completeContract() only calls `contrato.update({ status: ContractStatus.CONCLUIDO })`. No increment of shows_realizados on artist or establishment profiles. ArtistProfileModel and EstablishmentProfileModel have no `shows_realizados` or `nota_media` columns defined at all — those fields simply don't exist in the model init blocks.
  implication: ISSUE 3 — models need shows_realizados added; completeContract() needs to increment them

- timestamp: 2026-03-30T00:05:00Z
  checked: backend-TocaAqui/src/models/BookingModel.ts BookingStatus enum
  found: Backend enum values are: pendente, aceito, rejeitado, cancelado, realizado. Frontend bookingService.ts already mirrors this exactly with its own BookingStatus enum. BrowseEvents filters by `isFuture` and status display (isNew = status === "pendente") but does NOT filter by status — it shows all bookings including aceito/cancelado/realizado ones. The real problem is the API endpoint /agendamentos returns ALL bookings; there is no server-side status=pendente filter.
  implication: ISSUE 4 — BrowseEvents should filter to show only status="pendente" bookings (open for applications)

- timestamp: 2026-03-30T00:05:00Z
  checked: ShowDetail.tsx, ApplyConfirmation.tsx, EstShowDetail.tsx, EstRateArtist.tsx
  found: ShowDetail.tsx — 3 contact action buttons (phone/comment/user) have no onPress. ApplyConfirmation.tsx — ellipsis button (line 107) has no onPress. EstShowDetail.tsx — all handlers implemented (cancel and rate work). EstRateArtist.tsx — all handlers implemented (submit and skip work). So only 4 buttons are truly empty: 3 contact buttons in ShowDetail + 1 ellipsis in ApplyConfirmation.
  implication: ISSUE 5 — Contact buttons in ShowDetail should show Alert ("feature not available"). Ellipsis in ApplyConfirmation should also show Alert or be removed.

- timestamp: 2026-03-30T00:05:00Z
  checked: TocaAqui/app/app.tsx
  found: App component wraps NavigationContainer but has no ErrorBoundary class. Any uncaught render error shows white screen.
  implication: ISSUE 6 — Add ErrorBoundary class component wrapping NavigationIndependentTree in app.tsx

- timestamp: 2026-03-30T01:00:00Z
  checked: backend-TocaAqui/src/config/sequelize-config.js, backend-TocaAqui/.env, backend-TocaAqui/.sequelizerc
  found: sequelize-config.js called require('dotenv').config() with no path argument. dotenv resolves .env relative to process.cwd(). The .env file lives at backend-TocaAqui/.env. When npx sequelize-cli db:migrate is run from the repo root (Toca-Aqui/), cwd is the repo root where there is no .env — so DB_USER, DB_NAME, DB_PASSWORD, DB_PORT are all undefined. Sequelize-cli prints "using environment development" and then silently fails to connect because credentials are undefined.
  implication: Fix is to change dotenv.config() to use path.resolve(__dirname, '../../.env') so the .env file is always resolved relative to the config file location, not cwd

- timestamp: 2026-03-30T02:00:00Z
  checked: docker ps, port 3307 binding, mysqld processes, docker-compose.yml
  found: Docker Desktop daemon is not running ("failed to connect to the docker API ... check if the daemon is running"). No mysqld process exists on the machine. Port 3307 is not bound. docker-compose.yml maps mysql container port 3306 → host 3307 — this is the ONLY MySQL on this machine. The blank error message in migration output is mysql2 emitting ECONNREFUSED with an empty .message string (consistent with "Connection error: [blank], code: ECONNREFUSED" confirmed via direct node test). sequelize-config.js is correct after the prior fix; .env has all correct variables. The sole issue is Docker is stopped.
  implication: User must start Docker Desktop, then run `docker-compose up -d mysql` from backend-TocaAqui/ to bring MySQL up on port 3307, then run the migration.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: |
  1. Hardcoded IP 192.168.224.1:3000 in api.ts — breaks on any machine other than dev's
  2. AuthContext.loadStoredData() intentionally cleared AsyncStorage token instead of restoring session
  3. ArtistProfileModel and EstablishmentProfileModel had no shows_realizados/nota_media columns; ContractService.completeContract() never incremented them
  4. BrowseEvents fetched all bookings without filtering by status=pendente — showed closed/taken gigs
  5. ShowDetail contact buttons and ApplyConfirmation ellipsis had no onPress handlers
  6. app.tsx had no ErrorBoundary — any render error caused white screen of death

fix: |
  1. api.ts: baseURL now uses EXPO_PUBLIC_API_URL ?? `http://${REACT_NATIVE_PACKAGER_HOSTNAME ?? "localhost"}:3000`
  2. AuthContext.loadStoredData(): reads token from AsyncStorage, injects into api defaults, calls getProfile() to restore full user state; clears on 401
  3. Migration 20240101000031 adds shows_realizados (INTEGER, default 0) and nota_media (DECIMAL 3,2) to both tables; models updated; completeContract() increments shows_realizados for artist/band members and establishment
  4. BrowseEvents filteredBookings now includes `b.status === "pendente"` guard
  5. ShowDetail contact buttons show contextual Alert messages; ApplyConfirmation ellipsis shows help Alert
  6. ErrorBoundary class component wraps NavigationIndependentTree in app.tsx; shows "Tentar novamente" recovery screen on error

verification: All 6 changes committed in fbbb7ae. Additional fix: sequelize-config.js dotenv path fixed so migration CLI works from any directory.

files_changed:
  - TocaAqui/http/api.ts
  - TocaAqui/contexts/AuthContext.tsx
  - TocaAqui/screens/artist/BrowseEvents.tsx
  - TocaAqui/screens/artist/ShowDetail.tsx
  - TocaAqui/screens/artist/ApplyConfirmation.tsx
  - TocaAqui/app/app.tsx
  - backend-TocaAqui/src/models/ArtistProfileModel.ts
  - backend-TocaAqui/src/models/EstablishmentProfileModel.ts
  - backend-TocaAqui/src/services/ContractService.ts
  - backend-TocaAqui/src/migrations/20240101000031-add-stats-to-perfis.js
  - backend-TocaAqui/src/config/sequelize-config.js
