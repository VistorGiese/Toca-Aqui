# Codebase Structure

**Analysis Date:** 2026-03-30

## Root Layout

```
Toca-Aqui/                          # Monorepo root
├── TocaAqui/                       # React Native / Expo mobile app
├── backend-TocaAqui/               # Node.js Express + Sequelize API
├── docs/                           # Architecture docs, Figma exports, ADRs
├── .planning/                      # GSD planning documents (codebase maps, phases)
├── .claude/                        # Claude Code memory and project config
├── .agents/                        # Agent skills
├── README.md
└── skills-lock.json
```

---

## Frontend (`TocaAqui/`)

```
TocaAqui/
├── app/
│   └── app.tsx                     # App entry point: providers + Navigate
├── navigation/
│   ├── Navigate.tsx                # Root stack: auth vs. app routing by role
│   ├── ArtistNavigator.tsx         # Artist bottom tabs + detail stack
│   ├── EstablishmentNavigator.tsx  # Establishment bottom tabs + detail stack
│   └── UserNavigator.tsx           # Common-user bottom tabs + detail stack
├── screens/
│   ├── *.tsx                       # Shared/auth/onboarding/legacy screens
│   ├── artist/                     # Artist-specific screens
│   ├── establishment/              # Establishment-specific screens
│   └── user/                       # Common-user audience screens
├── contexts/
│   ├── AuthContext.tsx             # Auth state: user, token, paginas, signIn/Out
│   └── AccountFromContexto.tsx    # Secondary account context
├── http/
│   ├── api.ts                      # Axios instance + JWT interceptors + 401 handler
│   ├── userService.ts              # Auth, profile, registration calls
│   ├── artistService.ts            # Artist profile CRUD
│   ├── artistaPublicoService.ts    # Public artist browsing
│   ├── bandService.ts              # Band management
│   ├── bandApplicationService.ts  # Artist applications to gigs
│   ├── bookingService.ts           # Gig/event booking
│   ├── contractService.ts          # Contract lifecycle
│   ├── establishmentService.ts    # Establishment profile CRUD
│   ├── showService.ts              # Public show listings
│   ├── eventService.ts             # Event details
│   ├── ingressoService.ts          # Ticket purchase
│   ├── avaliacaoService.ts         # Show ratings
│   ├── comentarioService.ts        # Show comments
│   └── RegisterService.ts          # Registration helpers
├── types/
│   └── index.ts                    # Global TypeScript types (UserRole, User, Band, etc.)
├── components/
│   ├── Allcomponents/              # Shared UI components
│   ├── CreateEvent/                # Event creation components
│   ├── EventDetail/                # Event detail components
│   ├── InitialPage/                # Landing page components
│   ├── RegisterPage/               # Registration components
│   └── UpdateEvent/                # Event editing components
├── assets/
│   ├── fonts/                      # Akira Expanded, Montserrat, Poppins
│   └── images/                     # App images (All, Initial, Login, Register)
├── utils/                          # Frontend utility helpers
├── package.json
├── tsconfig.json
└── app.json                        # Expo configuration
```

### Frontend Screen Inventory

**Auth & Shared (`TocaAqui/screens/*.tsx`):**
- `Initial.tsx`, `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `RoleSelection.tsx`
- `RegisterPassword.tsx`, `RegisterLocationName.tsx`, `RegisterLocationAndress.tsx`, `ConfirmRegister.tsx`
- `OnboardingArtistProfile.tsx`, `OnboardingArtistBio.tsx`
- `OnboardingEstIdentidade.tsx`, `OnboardingEstFuncionamento.tsx`, `OnboardingEstPerfil.tsx`, `OnboardingEstApresentacao.tsx`
- Legacy: `HomePage.tsx`, `Schedulling.tsx`, `CreateEvent.tsx`, `UpdateEvent.tsx`, `InfoEvent.tsx`, `ArtistProfile.tsx`, `Profile.tsx`, `EventDetail.tsx`, `SearchArtists.tsx`, `AdditionalInformation.tsx`, `InformationPersonResponsible.tsx`

**Artist (`TocaAqui/screens/artist/*.tsx`):**
- Tabs: `ArtistHome.tsx`, `BrowseEvents.tsx`, `ArtistSchedule.tsx`, `MyApplications.tsx`, `ArtistEPK.tsx`
- Details: `EventDetailArtist.tsx`, `ApplyConfirmation.tsx`, `ShowDetail.tsx`, `ContractDetail.tsx`, `RateEstablishment.tsx`, `Subscription.tsx`
- Profile: `ArtistProfileEdit.tsx`, `RegisterArtist.tsx`, `MyBands.tsx`, `CreateBand.tsx`, `EditBand.tsx`, `BandDetail.tsx`, `MyContracts.tsx`

**Establishment (`TocaAqui/screens/establishment/*.tsx`):**
- Tabs: `EstHome.tsx`, `EstGigs.tsx`, `EstSearch.tsx`, `EstSchedule.tsx`, `EstProfile.tsx`
- Details: `EstNewGig.tsx`, `EstGigApplications.tsx`, `EstArtistProfile.tsx`, `EstAcceptContract.tsx`, `EstShowDetail.tsx`, `EstNotifications.tsx`, `EstRateArtist.tsx`, `EstSettings.tsx`

**Common User (`TocaAqui/screens/user/*.tsx`):**
- Tabs: `UserFeed.tsx`, `UserSearch.tsx`, `UserTickets.tsx`, `UserFavorites.tsx`, `UserProfile.tsx`
- Details: `UserShowDetail.tsx`, `UserCheckout.tsx`, `UserPurchaseConfirmation.tsx`, `UserTicketDetail.tsx`, `UserArtistProfile.tsx`, `UserRateShow.tsx`, `UserComments.tsx`, `UserSettings.tsx`, `UserNotifications.tsx`
- Onboarding: `UserOnboardingGenres.tsx`, `UserOnboardingLocation.tsx`

---

## Backend (`backend-TocaAqui/`)

```
backend-TocaAqui/
├── src/
│   ├── config/
│   │   ├── database.ts             # Sequelize + MySQL connection
│   │   ├── redis.ts                # ioredis singleton (RedisService)
│   │   ├── env.ts                  # Typed env var loader
│   │   ├── stripe.ts               # Stripe SDK init
│   │   ├── cache.ts                # Cache utilities
│   │   ├── swagger.ts              # API docs
│   │   └── sequelize-config.js     # Sequelize CLI config (migrations)
│   ├── controllers/                # Thin HTTP handlers, call services via asyncHandler
│   ├── services/                   # Business logic layer
│   ├── models/                     # Sequelize model definitions
│   │   └── associations.ts         # All model relationships in one file
│   ├── routes/                     # Express route registrations
│   ├── schemas/                    # Zod validation schemas per domain
│   ├── middleware/
│   │   ├── authmiddleware.ts       # JWT verify + Redis blacklist check
│   │   ├── authorizationMiddleware.ts  # Role-based access
│   │   ├── validate.ts             # Zod schema validate middleware
│   │   ├── errorHandler.ts         # Central error handler + asyncHandler
│   │   └── rateLimiter.ts          # Express rate limiting
│   ├── errors/
│   │   └── AppError.ts             # Custom error class with statusCode + extra
│   ├── utils/
│   │   └── jwt.ts                  # generateToken, verifyToken
│   ├── types/                      # Backend TypeScript types
│   ├── migrations/                 # Sequelize migration files
│   ├── seeders/                    # Database seed files
│   └── __tests__/                  # Jest test files (co-located in single directory)
├── database/
│   └── init.sql                    # Database initialization SQL
├── migrations/                     # Additional migration files
├── nginx/                          # Nginx reverse proxy config
├── social-service/                 # Incomplete secondary microservice (not integrated)
│   └── src/                        # Mirrors main src structure
├── uploads/                        # Multer file upload storage (local)
├── coverage/                       # Jest coverage output
└── package.json
```

### Backend Controller-to-Route Mapping

| Controller | Route File | Domain |
|---|---|---|
| `UserController.ts` | `UserRoutes.ts` | Auth, registration, profile |
| `BookingController.ts` | `BookingRoutes.ts` | Gig events |
| `BandApplicationController.ts` | `BandApplicationRoutes.ts` | Artist applications |
| `ContractController.ts` | `ContractRoutes.ts` | Contract lifecycle |
| `ShowController.ts` | `ShowRoutes.ts` | Public show listings |
| `BandController.ts` | `BandRoutes.ts` | Band CRUD |
| `BandManagementController.ts` | `BandManagementRoutes.ts` | Band membership |
| `EstablishmentController.ts` | `EstablishmentRoutes.ts` | Establishment profile |
| `EstablishmentMemberController.ts` | — | Establishment team members |
| `NotificationController.ts` | `NotificationRoutes.ts` | In-app notifications |
| `PaymentController.ts` | `PaymentRoutes.ts` | Stripe payments |
| `StripeWebhookController.ts` | `WebhookRoutes.ts` | Stripe webhook events |
| `IngressoController.ts` | `IngressoRoutes.ts` | Ticket purchase |
| `AvaliacaoShowController.ts` | `AvaliacaoShowRoutes.ts` | Post-show ratings |
| `ComentarioShowController.ts` | `ComentarioShowRoutes.ts` | Show comments |
| `FavoriteController.ts` | `FavoriteRoutes.ts` | User favorites |
| `AddressController.ts` | `AddressRoutes.ts` | Address management |
| `AdminController.ts` | `AdminRoutes.ts` | Admin operations |
| `SeguidorArtistaController.ts` | `ArtistaPublicoRoutes.ts` | Artist following |

---

## Key Files

| File | Purpose |
|---|---|
| `TocaAqui/app/app.tsx` | App entry: providers, font loading, SplashScreen |
| `TocaAqui/navigation/Navigate.tsx` | Root navigator, auth guard, role routing |
| `TocaAqui/contexts/AuthContext.tsx` | Global auth state and token management |
| `TocaAqui/http/api.ts` | Axios base instance with JWT interceptors |
| `TocaAqui/types/index.ts` | Shared frontend TypeScript types |
| `backend-TocaAqui/src/models/associations.ts` | All Sequelize model associations |
| `backend-TocaAqui/src/services/AuthService.ts` | Login, register, logout, password reset |
| `backend-TocaAqui/src/middleware/authmiddleware.ts` | JWT + Redis blacklist auth check |
| `backend-TocaAqui/src/middleware/errorHandler.ts` | Central error handling + asyncHandler |
| `backend-TocaAqui/src/config/database.ts` | MySQL connection via Sequelize |
| `backend-TocaAqui/src/config/redis.ts` | ioredis singleton for caching/blacklisting |
| `backend-TocaAqui/src/errors/AppError.ts` | Custom error class used throughout services |

---

## Configuration Files

| File | Purpose |
|---|---|
| `TocaAqui/app.json` | Expo app configuration (name, version, bundle ID) |
| `TocaAqui/tsconfig.json` | TypeScript config; `@/` alias maps to `TocaAqui/` |
| `TocaAqui/package.json` | Frontend dependencies (Expo SDK, React Navigation, Axios) |
| `backend-TocaAqui/package.json` | Backend dependencies (Express, Sequelize, ioredis, Stripe, Zod) |
| `backend-TocaAqui/src/config/sequelize-config.js` | Sequelize CLI config for migrations |
| `backend-TocaAqui/nginx/` | Nginx reverse proxy configuration |

---

## Where to Add New Code

**New artist screen:**
- Implementation: `TocaAqui/screens/artist/YourScreen.tsx`
- Register in: `TocaAqui/navigation/ArtistNavigator.tsx` (add to `ArtistStackParamList` and `Stack.Screen`)

**New establishment screen:**
- Implementation: `TocaAqui/screens/establishment/YourScreen.tsx`
- Register in: `TocaAqui/navigation/EstablishmentNavigator.tsx`

**New common-user screen:**
- Implementation: `TocaAqui/screens/user/YourScreen.tsx`
- Register in: `TocaAqui/navigation/UserNavigator.tsx`

**New HTTP service call:**
- Add to the relevant existing service file in `TocaAqui/http/` or create a new `TocaAqui/http/yourDomainService.ts`

**New backend endpoint:**
1. Add Zod schema to `backend-TocaAqui/src/schemas/yourSchemas.ts`
2. Add business logic to `backend-TocaAqui/src/services/YourService.ts`
3. Add controller method to `backend-TocaAqui/src/controllers/YourController.ts` using `asyncHandler`
4. Register route in `backend-TocaAqui/src/routes/YourRoutes.ts` with `authMiddleware` + `validate`
5. Mount route in main app entry

**New Sequelize model:**
- Create `backend-TocaAqui/src/models/YourModel.ts`
- Add all associations to `backend-TocaAqui/src/models/associations.ts`
- Add to exports at bottom of `associations.ts`

**New test:**
- All backend tests: `backend-TocaAqui/src/__tests__/YourSubject.test.ts`

**Shared types:**
- Frontend: `TocaAqui/types/index.ts`
- Backend: `backend-TocaAqui/src/types/`
