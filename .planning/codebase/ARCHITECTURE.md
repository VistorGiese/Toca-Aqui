# Architecture

**Analysis Date:** 2026-03-30

## Overall Pattern

The system is a two-tier mobile marketplace:

- **Frontend:** React Native / Expo mobile app (`TocaAqui/`) — a purely client-side SPA that communicates exclusively through a REST API.
- **Backend:** Express + Sequelize REST API (`backend-TocaAqui/src/`) — a layered MVC server with MySQL for persistence, Redis for caching and token blacklisting, and Stripe for payments.

There is also an incomplete `backend-TocaAqui/social-service/` microservice directory (separate Express app) that mirrors the main backend layer structure but is not yet integrated into the primary navigation or auth flow.

The system has three distinct authenticated personas routed at runtime: `artist`, `establishment`, and `common_user` (audience/spectator).

---

## Frontend Architecture

**Entry point:** `TocaAqui/app/app.tsx`

The app mounts two React Context providers (`AuthProvider`, `AccountProvider`) around the root navigator. Font loading via `expo-font` gates rendering; `SplashScreen` is held until fonts resolve.

**Context Layer:**
- `TocaAqui/contexts/AuthContext.tsx` — Global auth state. Holds `user`, `token`, `paginas` (which artist/establishment profile the user owns), `isLoading`, and `isAuthenticated`. Exposes `signIn`, `signInWithToken`, `signOut`, `updateUser`. Session is intentionally NOT restored from AsyncStorage on app start — every launch begins at Login.
- `TocaAqui/contexts/AccountFromContexto.tsx` — Secondary context (account switching or multi-profile support).

**HTTP Layer (`TocaAqui/http/`):**
- `api.ts` — Axios instance with a hardcoded `baseURL` pointing to the developer's LAN IP. Request interceptor injects `Authorization: Bearer <token>` from AsyncStorage. Response interceptor fires the `onUnauthorized` callback on 401, which triggers `clearAuth()` in `AuthContext`.
- One service file per domain (e.g., `userService.ts`, `bandService.ts`, `contractService.ts`). Each service wraps `api.get/post/put/delete` calls and returns typed responses.

**Navigation Layer (`TocaAqui/navigation/`):**
- `Navigate.tsx` — Root stack navigator. Uses `isAuthenticated` from `AuthContext` to split the screen tree into auth screens (`Login`, `Register`, `Initial`, `ForgotPassword`, `RoleSelection`) vs. app screens. On authenticated, initial route is determined by `user.role`.
- `ArtistNavigator.tsx` — Bottom tab navigator (Home, Vagas, Agenda, Candidaturas, Perfil) wrapped in a stack navigator for detail screens (`EventDetailArtist`, `ApplyConfirmation`, `ShowDetail`, `ContractDetail`, `RateEstablishment`, `Subscription`).
- `EstablishmentNavigator.tsx` — Bottom tab navigator (Home, Vagas, Buscar, Agenda, Perfil) wrapped in a stack for detail screens (`EstNewGig`, `EstGigApplications`, `EstArtistProfile`, `EstAcceptContract`, `EstShowDetail`, `EstNotifications`, `EstRateArtist`, `EstSettings`).
- `UserNavigator.tsx` — Bottom tab navigator (Feed, Buscar, Ingressos, Favoritos, Perfil) wrapped in a stack for detail screens (`UserShowDetail`, `UserCheckout`, `UserPurchaseConfirmation`, `UserTicketDetail`, `UserArtistProfile`, `UserRateShow`, `UserComments`, `UserSettings`, `UserNotifications`).

**Screen Layer (`TocaAqui/screens/`):**
- Flat screens at `TocaAqui/screens/*.tsx` — shared auth, onboarding, and legacy screens.
- `TocaAqui/screens/artist/*.tsx` — artist-specific screens.
- `TocaAqui/screens/establishment/*.tsx` — establishment-specific screens.
- `TocaAqui/screens/user/*.tsx` — common-user audience screens.

**Types:** `TocaAqui/types/index.ts` — shared TypeScript types: `UserRole`, `User`, `Band`, `ContractStatus`, `PaginatedResponse`, `MinhasPaginas`.

---

## Backend Architecture

**Layer order (request → response):** Route → Middleware → Controller → Service → Model

**Routes (`backend-TocaAqui/src/routes/`):**
Each route file registers Express routes and applies `authMiddleware` and Zod `validate` middleware before delegating to controller methods. Route files: `UserRoutes.ts`, `BookingRoutes.ts`, `BandApplicationRoutes.ts`, `ContractRoutes.ts`, `ShowRoutes.ts`, `BandRoutes.ts`, `BandManagementRoutes.ts`, `NotificationRoutes.ts`, `PaymentRoutes.ts`, `WebhookRoutes.ts`, `ArtistaPublicoRoutes.ts`, `AvaliacaoShowRoutes.ts`, `ComentarioShowRoutes.ts`, `FavoriteRoutes.ts`, `IngressoRoutes.ts`, `AddressRoutes.ts`, `AdminRoutes.ts`.

**Middleware (`backend-TocaAqui/src/middleware/`):**
- `authmiddleware.ts` — Verifies JWT, checks Redis token blacklist, attaches `req.user`.
- `authorizationMiddleware.ts` — Role-based access checks after auth.
- `validate.ts` — Zod schema validation; returns 400 on invalid payload.
- `errorHandler.ts` — Central error handler. Handles `AppError` (custom), Sequelize errors, JWT errors, Multer errors, and unhandled errors. Exports `asyncHandler` wrapper for controllers.
- `rateLimiter.ts` — Express rate limiting.

**Controllers (`backend-TocaAqui/src/controllers/`):**
Thin layer. Each controller method calls one or more service methods, wrapped with `asyncHandler`. Delegates all business logic to services.

**Services (`backend-TocaAqui/src/services/`):**
Business logic layer. Key services:
- `AuthService.ts` — Register, login (bcrypt), logout (Redis blacklist), forgot/reset password (Redis tokens), email verification, profile creation.
- `BandApplicationService.ts` — Artist application to establishment gig events.
- `ContractService.ts` — Contract lifecycle management.
- `PaymentService.ts` / `StripeService.ts` — Stripe payment integration.
- `NotificationService.ts` / `PubSubService.ts` — Push notification and pub/sub.
- `EmailService.ts` — Transactional email (password reset, verification).
- `CronService.ts` — Scheduled jobs (contract completion, payment reminders).
- `IngressoService.ts` — Ticket purchase and QR code management.
- `UploadService.ts` — Multer file uploads.
- `ShowService.ts` — Public show listings.
- `AvaliacaoShowService.ts` — Post-show ratings.
- `ComentarioShowService.ts` — Show comments.
- `SeguidorArtistaService.ts` — Artist follower system.

**Models (`backend-TocaAqui/src/models/`):**
Sequelize models for MySQL. All associations are declared in `associations.ts` which is the single import point for all models. Key models: `UserModel`, `ArtistProfileModel`, `EstablishmentProfileModel`, `BookingModel`, `BandModel`, `BandMemberModel`, `BandApplicationModel`, `ContractModel`, `ContractHistoryModel`, `PaymentModel`, `IngressoModel`, `NotificationModel`, `FavoriteModel`, `AvaliacaoShowModel`, `ComentarioShowModel`, `CurtidaComentarioModel`, `SeguidorArtistaModel`, `PreferenciaUsuarioModel`, `EstablishmentMemberModel`, `AddressModel`.

**Schemas (`backend-TocaAqui/src/schemas/`):**
Zod validation schemas per domain. Consumed by `validate` middleware before controller execution.

**Config (`backend-TocaAqui/src/config/`):**
- `database.ts` — Sequelize + MySQL connection.
- `redis.ts` — ioredis singleton (`RedisService`) used for caching, token blacklisting, password reset tokens, and email verification tokens.
- `env.ts` — Typed environment variable loader.
- `stripe.ts` — Stripe SDK initialization.
- `swagger.ts` — API documentation.
- `cache.ts` — Cache helper utilities.

**Errors (`backend-TocaAqui/src/errors/AppError.ts`):**
Custom `AppError` class with `statusCode` and optional `extra` payload. Thrown by services, caught by `errorHandler`.

---

## Data Flow

**Gig Booking Flow (core marketplace flow):**

1. Establishment creates a `Booking` (gig event) via `POST /shows` → `BookingController` → `ShowService` → `BookingModel`.
2. Artist browses available gigs and submits a `BandApplication` via `POST /band-applications` → `BandApplicationController` → `BandApplicationService`.
3. Establishment reviews applications, accepts one → `ContractModel` is created (status: `aguardando_aceite`).
4. Artist accepts the contract → status transitions to `aceito`.
5. Show occurs. Post-show: both parties can rate each other (`AvaliacaoShowModel`).
6. Contract marked `concluido`. Payment processed through Stripe (`PaymentModel`).

**Auth Flow (see dedicated section below).**

**Ticket Purchase Flow:**
1. Common user browses shows (`UserFeed`, `UserSearch`).
2. Selects show → `UserCheckout` → calls Stripe payment → `IngressoModel` created on success.
3. Ticket accessible via `UserTickets` with QR code.

**State Management:**
- Frontend: React Context only (no Redux or Zustand). Auth state in `AuthContext`, per-screen state via `useState`/`useEffect`.
- Backend: Stateless HTTP; session state in Redis (token blacklist, reset tokens).

---

## Key Abstractions

**`BookingModel` (Gig Event):**
- The central entity. Represents a performance slot opened by an establishment.
- Links: `EstablishmentProfileModel` (owner), `BandApplicationModel[]` (candidates), `ContractModel` (accepted artist), `IngressoModel[]` (audience tickets), `AvaliacaoShowModel[]` (ratings).
- File: `backend-TocaAqui/src/models/BookingModel.ts`

**`ArtistProfileModel`:**
- A user can have zero or one artist profile. This is the entity used for all performer operations (solo artist or band leader). "Artista" and "banda" share this profile as base.
- File: `backend-TocaAqui/src/models/ArtistProfileModel.ts`

**`MinhasPaginas`:**
- Frontend type (`TocaAqui/types/index.ts`) returned by `GET /usuarios/minhas-paginas`. Tells the frontend which artist profile and/or establishment profile the authenticated user owns. Drives post-login routing and UI branching.

**`AuthRequest`:**
- Backend extended Express `Request` type (`backend-TocaAqui/src/middleware/authmiddleware.ts`). Adds `req.user` (`id`, `email`, `role`) and `req.token` after JWT verification.

**`asyncHandler`:**
- Wrapper exported from `backend-TocaAqui/src/middleware/errorHandler.ts`. Wraps async controller functions so thrown errors propagate to the central `errorHandler` middleware without explicit try/catch in each controller.

---

## Auth Flow

**Registration:**
1. `POST /usuarios/registro` with `{ nome_completo, email, senha, tipo_usuario }`.
2. `AuthService.register` validates email/password format, hashes password with bcrypt (10 rounds), creates `UserModel`.
3. Returns `{ user, token }`. Frontend stores token in `AsyncStorage`.

**Login:**
1. `POST /usuarios/login` with `{ email, senha }`.
2. `AuthService.login` verifies bcrypt hash, generates JWT via `generateToken` (`backend-TocaAqui/src/utils/jwt.ts`).
3. Frontend calls `userService.login` → stores token in AsyncStorage → `AuthContext.signIn` sets React state.
4. `AuthContext` also calls `userService.getProfile()` to fetch associated artist/establishment profile IDs, and `userService.getMinhasPaginas()` to determine which navigators to show.

**Per-request auth:**
1. Axios request interceptor (`TocaAqui/http/api.ts`) reads token from `AsyncStorage` and injects `Authorization: Bearer <token>`.
2. `authMiddleware` verifies JWT signature, checks Redis blacklist (`blacklist:<token>`), attaches `req.user`.

**Logout:**
1. Frontend calls `userService.logout()` → `POST /usuarios/logout`.
2. `AuthService.logout` adds the token to Redis blacklist with TTL equal to remaining token lifetime.
3. Frontend clears `AuthContext` state and AsyncStorage.

**Token revocation:** Redis blacklist ensures logged-out tokens are rejected even before JWT expiry.

**Password reset:** Crypto random token stored in Redis (`reset:<token>`) with 1-hour TTL. Email sent via `EmailService`. Reset endpoint reads token from Redis, updates hashed password, deletes Redis key.
