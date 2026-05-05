# Codebase Concerns

**Analysis Date:** 2026-03-30

---

## Critical Issues

**Hardcoded Backend IP in Frontend:**
- Files: `TocaAqui/http/userService.ts`, `establishmentService.ts`, `contractService.ts`, `bandApplicationService.ts`, `artistaPublicoService.ts`
- Impact: App breaks on any machine that is not the developer's. Blocks every demo and presentation
- Fix: Move base URL to a single constant in `TocaAqui/constants/api.ts` (or `.env` via `expo-constants`). All service files import from that one location

**No Session Restore on App Launch:**
- Files: `TocaAqui/contexts/AuthContext.tsx`, `TocaAqui/app/app.tsx`
- Impact: Users are logged out every time the app restarts. Unusable in demo — evaluators always see the login screen
- Fix: In `AuthContext` `useEffect` on mount, read token from AsyncStorage, validate it, and restore user state before rendering the navigator

**Wrong API Routes in `bandApplicationService`:**
- Files: `TocaAqui/http/bandApplicationService.ts`, `backend-TocaAqui/src/routes/BandApplicationRoutes.ts`
- Impact: Apply-to-gig and list-applications flows return 404s — core artist workflow is non-functional
- Fix: Audit every path in `bandApplicationService.ts` against `BandApplicationRoutes.ts` and align

**CORS Wildcard (`*`) in Production Config:**
- Impact: Any website can make credentialed requests to the API
- Fix: Restrict `origin` to Expo dev URL and production domain using an allowlist array

---

## Security Concerns

**Rate Limiter Bypassed in Development:**
- Files: `backend-TocaAqui/src/middleware/rateLimiter.ts`
- Impact: Feature never exercised locally; cannot be demonstrated in TCC defense
- Fix: Keep rate limiting active in dev with a higher ceiling (e.g., 1000 req/min). Only disable in `NODE_ENV === 'test'`

**Redis Token Blacklist Fragility:**
- Impact: If Redis is down, logout silently fails — invalidated tokens remain valid
- Fix: Wrap Redis blacklist check in try/catch. On Redis failure, deny the request (fail-closed)

**`any`-Typed JWT Decode:**
- Files: `backend-TocaAqui/src/controllers/UserController.ts`, `BandApplicationController.ts`, `BookingController.ts`
- Impact: Malformed or tampered token could cause undefined behavior in controller logic
- Fix: Define a `JwtPayload` interface. Validate decoded payload shape before accessing fields

**Unauthenticated File Serving:**
- Impact: Private documents (riders, contracts) are publicly accessible by URL if guessed
- Fix: Serve uploads through a controller that checks auth, or use signed URLs for cloud storage

**Mass Assignment in `updateBooking`:**
- Files: `backend-TocaAqui/src/controllers/BookingController.ts`
- Impact: Client could set `status`, `valor_total`, or other sensitive fields via request body
- Fix: Use the booking Zod schema to whitelist exactly which fields are updateable per role

---

## Performance Concerns

**No Pagination on BrowseEvents:**
- Files: `TocaAqui/screens/artist/BrowseEvents.tsx` + corresponding backend list endpoint
- Impact: Response time grows linearly with DB size; with 500+ gigs the screen will freeze
- Fix: Add `page`/`limit` query params to backend. Implement `FlatList` with `onEndReached` on frontend

**Sequential DB Queries Without Transactions in Accept Flow:**
- Files: `backend-TocaAqui/src/services/ContractService.ts`, `BandApplicationService.ts`
- Impact: A failure mid-flow leaves DB in partial state (e.g., application accepted but contract not created)
- Fix: Wrap multi-step operations in `sequelize.transaction(async (t) => { ... })`

**Redis Pattern Scan (`KEYS`):**
- Impact: `KEYS` blocks the Redis event loop and degrades performance at scale
- Fix: Replace pattern scans with Redis Sets or use `SCAN` with cursor iteration

**No Loading States / Skeleton Screens:**
- Files: `BrowseEvents.tsx`, `EstSchedule.tsx`, and others
- Impact: Blank view while data loads — looks unfinished during TCC presentation
- Fix: Add `ActivityIndicator` or skeleton placeholder components while `isLoading` is true

---

## Technical Debt

**125+ Usages of `any` Type:**
- Files: `TocaAqui/types/index.ts`, `TocaAqui/http/*.ts`, `backend-TocaAqui/src/controllers/*.ts`, `backend-TocaAqui/src/models/*.ts`
- Impact: Eliminates the safety benefit of TypeScript; runtime crashes not caught at compile time
- Fix: Enable `"noImplicitAny": true` in tsconfig and resolve iteratively. Start with shared types

**Inline Design System Duplication Across 15+ Screens:**
- Files: All screen files under `TocaAqui/screens/`
- Impact: A single color change requires editing 15+ files; impossible to theme
- Fix: Create `TocaAqui/constants/theme.ts` with `colors`, `spacing`, `typography`, `radii`. Import everywhere

**Duplicate Date and Validation Utilities:**
- Files: Scattered across `TocaAqui/screens/`
- Impact: Inconsistent date display and validation behavior across screens
- Fix: Create `TocaAqui/utils/date.ts` and `TocaAqui/utils/validation.ts`

**`associations.ts` Complexity:**
- Files: `backend-TocaAqui/src/models/associations.ts`
- Impact: Hard to trace model relationships; easy to introduce circular association bugs
- Fix: Group associations by domain (user/artist/establishment/booking) with section comments

**Incomplete `social-service/` Microservice:**
- Files: `backend-TocaAqui/social-service/`
- Impact: Dead code in the repo; misleads future developers about the architecture
- Fix: Either integrate or remove before TCC submission

---

## Inconsistencies

**`favorited`, `nota_media`, `shows_realizados` Never Populated:**
- Files: `backend-TocaAqui/src/models/ArtistProfileModel.ts`, `EstablishmentProfileModel.ts`
- Impact: Artist profiles always show 0 shows, 0 rating — critical for TCC demo credibility
- Fix: `shows_realizados` increments when contract moves to `concluido`. `nota_media` recomputes when a rating is saved. `favorited` needs wiring to favorites endpoint

**Frontend Gig Status Values Mismatched with Backend Enum:**
- Files: `EstGigApplications.tsx`, `BrowseEvents.tsx`, `bandApplicationSchemas.ts`
- Impact: Status filters silently return empty results; gigs that should show as "open" appear closed
- Fix: Create `TocaAqui/constants/statuses.ts` mirroring backend enum values exactly

**Genre Type Mismatch (string vs array):**
- Files: `TocaAqui/types/index.ts`, `backend-TocaAqui/src/models/ArtistProfileModel.ts`
- Impact: Genre data may be silently lost or corrupted on save; genre filtering unreliable
- Fix: Decide on `string[]` as canonical type. Apply consistently to model, migration, schema, and frontend type

**`nome_completo` Refactor Residue:**
- Impact: After the `nome→nome_completo` migration, any remaining `.nome` references display `undefined`
- Fix: Search for `.nome` (not `.nome_completo`) on user/profile objects and update

---

## Missing Pieces

**No Stripe Frontend Integration:**
- Impact: Payment flow — a core marketplace feature — cannot complete end-to-end
- Fix: Integrate `@stripe/stripe-react-native`. Implement `PaymentScreen` calling the backend payment-intent endpoint

**7+ Unimplemented `onPress` Handlers:**
- Files: `ShowDetail.tsx`, `EstShowDetail.tsx`, `EstRateArtist.tsx`, `ApplyConfirmation.tsx`
- Impact: Tapping buttons does nothing. TCC evaluators will interact with all of these
- Fix: Audit all `onPress={() => {}}` before presentation. Implement or hide the button

**No Error Boundary:**
- Files: `TocaAqui/app/app.tsx`
- Impact: Any unhandled JS error crashes the entire app to a white screen with no recovery
- Fix: Wrap `<NavigationContainer>` in a class-based `ErrorBoundary` with a user-friendly fallback screen

**No Notification Deep Links:**
- Files: `EstNotifications.tsx`, `EstablishmentNavigator.tsx`
- Impact: Notifications are read-only; tapping does not navigate to the relevant screen
- Fix: Add `target_screen` and `target_id` to the notification model. Use `navigation.navigate()` based on notification type

**`EstRateArtist` Not Wired to Backend:**
- Files: `TocaAqui/screens/establishment/EstRateArtist.tsx`
- Impact: Ratings submitted by establishments are never saved; `nota_media` stays 0 permanently

**No Offline / Network Error Handling:**
- Files: All `TocaAqui/http/` service files
- Impact: App freezes or shows blank screen when offline; no user feedback
- Fix: Add a global axios interceptor in `api.ts` that catches network errors and dispatches a user-facing alert

---

## Dependencies / Versioning

**Express v5 Alpha in Backend:**
- Impact: Not yet stable; third-party middleware may have undocumented incompatibilities. Error handler signature changed from v4
- Fix: For TCC stability, consider downgrading to Express `^4.21.x`. If v5 is intentional, document the decision and audit all middleware

**Stale `@types` Packages:**
- Impact: Type errors that don't reflect real runtime behavior, or real errors TypeScript misses
- Fix: Run `npx npm-check-updates -u` on dev dependencies and align `@types/*` with runtime package versions

**Duplicate Icon Libraries:**
- Files: `TocaAqui/package.json`
- Impact: Increased bundle size; two different APIs for the same icons causes inconsistent usage
- Fix: Standardize on `@expo/vector-icons`. Remove the other package

---

## Notes for Future Development

**TCC Presentation — Fix Before Demo (priority order):**
1. Hardcoded IP → environment variable (blocks every demo on any machine)
2. Session restore on app launch (evaluators will reopen the app)
3. `nota_media` / `shows_realizados` population (profiles look empty)
4. Gig status enum alignment (core artist workflow appears broken)
5. Unimplemented `onPress` handlers (evaluators will tap everything)
6. Error boundary (one crash = white screen, very visible)

**TCC Written Report Alignment:**
- The "artista e banda são o mesmo conceito" decision should be explicitly documented in the architecture section — reviewers may question the lack of a separate `Band` entity
- The `nome→nome_completo` refactor should be noted in the data model section with the migration date
- Payment flow incompleteness should be scoped as "future work" if Stripe frontend is not implemented before the defense

**Code Quality Before Submission:**
- Remove all `console.log` debug statements from production code paths
- Remove all `// TODO` and `// FIXME` comments or convert to tracked issues
- Ensure no `.env` files are committed (verify `.gitignore` covers all environments)
- Run `tsc --noEmit` and resolve all TypeScript errors before final submission
