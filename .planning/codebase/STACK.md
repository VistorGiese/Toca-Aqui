# Stack

**Analysis Date:** 2026-03-30

## Runtime & Language

**Backend Runtime:**
- Node.js 18 (Alpine) — specified in `backend-TocaAqui/Dockerfile` (`FROM node:18-alpine`)
- TypeScript ~5.9.2 (backend), ~5.8.3 (frontend) — both compile to strict mode

**Language:**
- TypeScript — used in 100% of source files in both `TocaAqui/` and `backend-TocaAqui/src/`
- JavaScript — only in `backend-TocaAqui/src/config/sequelize-config.js` (sequelize-cli requires .js)

**Package Manager:**
- npm — lockfiles present at `TocaAqui/package-lock.json` and `backend-TocaAqui/package-lock.json`

---

## Frontend Framework

**Core:**
- React 19.1.0 — `TocaAqui/package.json`
- React Native 0.81.5 — `TocaAqui/package.json`
- Expo ~54.0.23 — managed workflow, entry point `expo-router/entry`
- Expo Router ~6.0.14 — file-based routing within `TocaAqui/app/`
- New Architecture enabled (`newArchEnabled: true` in `TocaAqui/app.json`)

**Navigation:**
- `@react-navigation/native` ^7.1.6
- `@react-navigation/stack` ^7.4.7
- `@react-navigation/bottom-tabs` ^7.3.10
- Manual navigators defined in `TocaAqui/navigation/` (alongside expo-router in `TocaAqui/app/`)

**UI / Styling:**
- `@expo/vector-icons` ^15.0.3
- `react-native-vector-icons` ^10.3.0
- `expo-blur` ~15.0.7
- `react-native-reanimated` ~4.1.1
- `react-native-gesture-handler` ~2.28.0
- `react-native-svg` 15.12.1
- `react-native-modal` ^14.0.0-rc.1
- `react-native-calendars` ^1.1313.0
- `@expo-google-fonts/poppins` ^0.4.0 — primary font family

**Forms & Validation:**
- `react-hook-form` ^7.62.0 — all forms use Controller pattern
- `@hookform/resolvers` ^5.2.2
- `yup` ^1.7.0 — schema validation

**Storage:**
- `@react-native-async-storage/async-storage` 2.2.0 — persists `token`, `userRole`, `estabelecimentoId`

**HTTP Client:**
- `axios` ^1.12.2 — configured in `TocaAqui/http/api.ts`, base URL hardcoded to `http://192.168.224.1:3000`

**Date Utilities:**
- `date-fns` ^4.1.0

**Media / Files:**
- `expo-image-picker` ~17.0.10
- `expo-image` ~3.0.10
- `expo-file-system` ~19.0.17

---

## Backend Framework

**Core:**
- Express ^5.1.0 — main API server, entry point `backend-TocaAqui/src/index.ts`
- Express (^4.21.2) — also used in `social-service/` (separate microservice)

**Security Middleware:**
- `helmet` ^8.1.0 — CSP, HSTS, and other security headers
- `cors` ^2.8.5 — permissive in dev (`origin: true`), must be restricted in prod
- `express-rate-limit` ^8.3.1 — multiple limiter configs in `src/middleware/rateLimiter.ts`
- `bcryptjs` ^3.0.2 — password hashing
- `jsonwebtoken` ^9.0.2 — JWT auth (`JWT_SECRET`, `JWT_EXPIRES_IN` env vars)

**Validation:**
- `zod` ^4.3.6 — env validation (`src/config/env.ts`) and request body schemas in `src/schemas/`

**Documentation:**
- `swagger-jsdoc` ^6.2.8 + `swagger-ui-express` ^5.0.1
- Available at `GET /api-docs` (dev only)
- Spec defined in `src/config/swagger.ts`, reads annotations from `src/routes/` and `src/controllers/`

**Scheduled Jobs:**
- `node-cron` ^4.2.1 — three daily jobs in `src/services/CronService.ts`:
  - `00:05` — marks past events as "realizado"
  - `01:00` — completes finished contracts
  - `09:00` — sends payment reminders (timezone: `America/Sao_Paulo`)

**File Upload:**
- `multer` ^2.0.2 — disk storage to `uploads/` dir, 5 MB limit, jpg/png/webp only
- `uuid` ^11.1.0 — generates unique filenames
- Uploaded files served via `GET /uploads/:filename` (static middleware)

**Social Microservice (`backend-TocaAqui/social-service/`):**
- Separate Express ^4 app on port 3001
- Handles: Favoritos, Comentários, Avaliações
- Shares the same Redis instance for Pub/Sub
- Has its own MySQL database (`toca_aqui_social`)

---

## Database

**Primary Database:**
- MySQL 8.0 — image `mysql:8.0` in `docker-compose.yml`
- Main DB name: `toca_aqui_v4` (port 3307 externally)
- Social DB name: `toca_aqui_social` (port 3308 externally)
- Init script: `backend-TocaAqui/database/init.sql`

**ORM:**
- Sequelize ^6.37.7 — models in `backend-TocaAqui/src/models/`
- mysql2 ^3.14.4 — MySQL dialect driver
- Sequelize CLI ^6.6.5 — migrations in `backend-TocaAqui/migrations/`
- Connection pool: max 5, idle 10s, acquire 30s
- Associations defined in `backend-TocaAqui/src/models/associations.ts`

**Cache / Pub-Sub:**
- Redis 7 Alpine — image `redis:7-alpine`
- ioredis ^5.8.2 — client wrapper in `src/config/redis.ts` (Singleton)
- Two clients: one for cache ops, one dedicated subscriber (Pub/Sub) via `PubSubService`
- Cache TTL default: 300 seconds (5 min)
- Pattern-based invalidation used throughout services

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `stripe` | ^20.4.1 | Payment processing, webhooks |
| `nodemailer` | ^8.0.2 | Transactional email via SMTP |
| `sequelize` | ^6.37.7 | ORM for MySQL |
| `ioredis` | ^5.8.2 | Redis cache + Pub/Sub |
| `jsonwebtoken` | ^9.0.2 | JWT generation/validation |
| `bcryptjs` | ^3.0.2 | Password hashing |
| `zod` | ^4.3.6 | Env + request validation |
| `multer` | ^2.0.2 | Multipart file upload |
| `node-cron` | ^4.2.1 | Scheduled background jobs |
| `cpf-cnpj-validator` | ^1.0.3 | Brazilian document validation |
| `axios` | ^1.12.2 | Frontend HTTP client |
| `react-hook-form` | ^7.62.0 | Frontend form management |
| `yup` | ^1.7.0 | Frontend form schema validation |
| `date-fns` | ^4.1.0 | Date manipulation (frontend) |

---

## Dev Tools

**Backend:**
- `ts-node` ^10.9.2 — dev server (`npm run dev`)
- `jest` ^30.1.2 + `ts-jest` ^29.4.1 — test runner
- `supertest` ^7.1.4 — HTTP integration testing
- `sequelize-mock` ^0.10.2 — mock ORM in tests
- `sequelize-cli` ^6.6.5 — migration management
- TypeScript target: ES2020, module: CommonJS
- Test config: `backend-TocaAqui/jest.config.js`

**Frontend:**
- `eslint` ^9.25.0 + `eslint-config-expo` ~9.2.0
- ESLint config: `TocaAqui/eslint.config.js`
- TypeScript strict mode, path alias `@/*` → `./*` (configured in `TocaAqui/tsconfig.json`)
- Expo dev tools: `expo start` with Metro bundler

**Infrastructure:**
- Docker + Docker Compose — `backend-TocaAqui/docker-compose.yml`
- Nginx 1.25 Alpine — reverse proxy routing `/api/main/*` → port 3000, `/api/social/*` → port 3001
- Nginx config: `backend-TocaAqui/nginx/nginx.conf`
- Postman collections: `Toca Aqui Platform - Complete Flow.postman_collection.json` and `Toca_Aqui_API_ADMIN.postman_collection.json`

---

*Stack analysis: 2026-03-30*
