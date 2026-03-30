# Integrations

**Analysis Date:** 2026-03-30

---

## External APIs

### Stripe — Payment Processing
- **Purpose:** Artist contract deposits (sinal) and balance payments (restante), refunds
- **SDK:** `stripe` ^20.4.1
- **API Version:** `2026-02-25.clover` (set in `backend-TocaAqui/src/config/stripe.ts`)
- **Client:** Lazy-initialized singleton via `getStripe()` in `src/config/stripe.ts`
- **Stripe operations used:**
  - `stripe.paymentIntents.create` — creates PaymentIntent in BRL
  - `stripe.paymentIntents.retrieve` — fetches client_secret for frontend
  - `stripe.webhooks.constructEvent` — validates incoming webhook signature
  - `stripe.refunds.create` — issues full or partial refunds
- **Webhooks handled** (endpoint: `POST /webhooks`):
  - `payment_intent.succeeded` → marks payment as PAGO, triggers next payment step
  - `payment_intent.payment_failed` → marks payment as FALHOU
  - `charge.refunded` → marks payment as REEMBOLSADO
- **Webhook body parsing:** raw Buffer (applied before `express.json()` in `src/index.ts`)
- **Guard:** `isStripeConfigured()` returns `false` when `STRIPE_SECRET_KEY` is empty — all Stripe methods throw `AppError(500)` gracefully instead of crashing
- **Service:** `backend-TocaAqui/src/services/StripeService.ts`
- **Route:** `backend-TocaAqui/src/routes/WebhookRoutes.ts`, `backend-TocaAqui/src/routes/PaymentRoutes.ts`

---

## Authentication

### Custom JWT Authentication (self-hosted)
- **Mechanism:** Bearer token in `Authorization` header
- **Library:** `jsonwebtoken` ^9.0.2
- **Secret:** `JWT_SECRET` env var (minimum 16 characters, validated on startup via Zod)
- **Expiry:** `JWT_EXPIRES_IN` env var (default: `1d`, docker-compose uses `7d`)
- **Password hashing:** `bcryptjs` ^3.0.2
- **Email verification flow:** token sent via `sendVerificationEmail()` in `src/services/EmailService.ts`, verified via `GET /verificar-email?token=...`
- **Password reset flow:** token sent via `sendPasswordResetEmail()`, reset via frontend URL `FRONTEND_URL/redefinir-senha?token=...`
- **Backend auth service:** `backend-TocaAqui/src/services/AuthService.ts`
- **Frontend auth context:** `TocaAqui/contexts/AuthContext.tsx`
  - Stores `token`, `userRole`, `estabelecimentoId` in `AsyncStorage`
  - Session is NOT restored on app restart (cleared in `loadStoredData`)
  - 401 interceptor in `TocaAqui/http/api.ts` triggers `clearAuth()` automatically
- **User roles:** `admin`, `establishment_owner`, `artist`, `common_user`

---

## Storage / Media

### Local Disk Storage (self-hosted)
- **Purpose:** Profile photos, band images, establishment photos
- **Handler:** `multer` ^2.0.2 via `backend-TocaAqui/src/services/UploadService.ts`
- **Storage location:** `backend-TocaAqui/uploads/` directory (created on startup if missing)
- **Filename scheme:** `{uuid}-{timestamp}{ext}` (e.g., `a1b2c3-1712000000000.jpg`)
- **Accepted formats:** `.jpg`, `.jpeg`, `.png`, `.webp` (MIME + extension validated)
- **Size limit:** 5 MB per file, up to 5 files per multi-upload request
- **Public access:** `GET /uploads/:filename` — served as static files with `X-Content-Type-Options: nosniff`
- **No cloud storage configured** — all files are local to the container. Not persisted across container restarts unless a volume is mounted to `uploads/`.
- **Frontend upload:** uses `expo-image-picker` ~17.0.10 and `expo-file-system` ~19.0.17 to pick and upload files via multipart form

---

## Email / Notifications

### SMTP Email (Nodemailer)
- **Library:** `nodemailer` ^8.0.2
- **Service:** `backend-TocaAqui/src/services/EmailService.ts`
- **Default SMTP host:** `smtp.mailtrap.io` (for development/testing)
- **Emails sent:**
  - Email verification: `"Confirme seu email — Toca Aqui"` with 24h expiry link
  - Password reset: `"Redefinição de senha — Toca Aqui"` with 1h expiry link
- **From address:** `SMTP_FROM` env var (default: `noreply@tocaaqui.com`)
- **Required in production:** `SMTP_USER` and `SMTP_PASS` — app exits with `[FATAL]` if missing

### In-App Push Notifications (internal)
- **Mechanism:** Database-backed notification model (`src/models/NotificationModel.ts`)
- **Service:** `backend-TocaAqui/src/services/NotificationService.ts`
- **Routes:** `backend-TocaAqui/src/routes/NotificationRoutes.ts`
- **Notification types** (from `NotificationType` enum):
  - `PAGAMENTO_PENDENTE`, `PAGAMENTO_RECEBIDO`
  - `CONTRATO_CRIADO`, `CONTRATO_ACEITO`, `CONTRATO_CANCELADO`
  - `NOVA_CANDIDATURA`, `CANDIDATURA_ACEITA`, `CANDIDATURA_REJEITADA`
  - Others defined in `src/models/NotificationModel.ts`
- **Triggered by:** StripeService (payment events), CronService (payment reminders), BandApplicationService, ContractService
- **Frontend screen:** `TocaAqui/screens/establishment/EstNotifications.tsx`
- **No push notification provider** (e.g., FCM/APNs) — notifications are poll-based via API

---

## Environment Variables

All variables are validated with Zod at startup in `backend-TocaAqui/src/config/env.ts`. Missing required variables cause `process.exit(1)` with a descriptive error.

### Server
| Variable | Default | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | No | `development`, `test`, or `production` |
| `PORT` | `3000` | No | HTTP server port |

### Database
| Variable | Default | Required | Description |
|---|---|---|---|
| `DB_HOST` | `localhost` | Yes | MySQL host |
| `DB_PORT` | `3306` | No | MySQL port |
| `DB_NAME` | — | Yes | Database name (`toca_aqui_v4`) |
| `DB_USER` | — | Yes | MySQL user |
| `DB_PASSWORD` | `""` | No | MySQL password |

### JWT
| Variable | Default | Required | Description |
|---|---|---|---|
| `JWT_SECRET` | — | Yes (min 16 chars) | JWT signing secret |
| `JWT_EXPIRES_IN` | `1d` | No | Token expiry (e.g., `1d`, `7d`) |

### Redis
| Variable | Default | Required | Description |
|---|---|---|---|
| `REDIS_HOST` | `localhost` | No | Redis host |
| `REDIS_PORT` | `6379` | No | Redis port |
| `REDIS_PASSWORD` | — | No | Redis auth password |

### SMTP / Email
| Variable | Default | Required in prod | Description |
|---|---|---|---|
| `SMTP_HOST` | `smtp.mailtrap.io` | No | SMTP server hostname |
| `SMTP_PORT` | `587` | No | SMTP port |
| `SMTP_USER` | `""` | Yes | SMTP username |
| `SMTP_PASS` | `""` | Yes | SMTP password |
| `SMTP_FROM` | `noreply@tocaaqui.com` | No | Sender address |

### Stripe
| Variable | Default | Required in prod | Description |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `""` | Yes | Stripe secret key (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | `""` | Yes | Stripe webhook signing secret (`whsec_...`) |

### Frontend
| Variable | Default | Required | Description |
|---|---|---|---|
| `FRONTEND_URL` | `http://localhost:5173` | No | Used to build email links (verify/reset) |

### Social Service (separate `.env` in `social-service/`)
Same database, JWT, and Redis vars as main service, plus:
- `PORT` (default: `3001`)
- `FRONTEND_URL` (default: `http://localhost:5173`)

---

## SDK / Libraries

### Brazilian Document Validation
- `cpf-cnpj-validator` ^1.0.3 — validates CPF/CNPJ formats during user registration
- `cpf-validator` ^1.0.1 — secondary CPF validator
- Used in: `backend-TocaAqui/src/services/userValidationServices.ts`

### Redis Pub/Sub (internal message bus)
- **Library:** `ioredis` ^5.8.2 (two separate client instances)
- **Service:** `backend-TocaAqui/src/services/PubSubService.ts`
- **Publisher:** main Redis client (via `redisService.getClient().publish(channel, json)`)
- **Subscriber:** dedicated ioredis client in PubSubService
- **Channels and their effects:**

| Channel | Triggered by | Effect |
|---|---|---|
| `favorito.adicionado` | FavoriteService | Invalidates banda/estabelecimento cache |
| `favorito.removido` | FavoriteService | Invalidates banda/estabelecimento cache |
| `comentario.criado` | ComentarioShowService | Invalidates banda/agendamento cache |
| `comentario.deletado` | ComentarioShowService | Invalidates banda/agendamento cache |
| `avaliacao.criada` | AvaliacaoShowService | Invalidates bandas cache |
| `avaliacao.atualizada` | AvaliacaoShowService | Invalidates bandas cache |
| `avaliacao.deletada` | AvaliacaoShowService | Invalidates bandas cache |

### API Documentation
- `swagger-jsdoc` ^6.2.8 + `swagger-ui-express` ^5.0.1
- Endpoint: `GET /api-docs` (dev environment only)
- Spec source: JSDoc annotations in `src/routes/*.ts` and `src/controllers/*.ts`

### Nginx (API Gateway)
- Image: `nginx:1.25-alpine`
- Config: `backend-TocaAqui/nginx/nginx.conf`
- Routes:
  - `GET /api/main/*` → `app:3000` (main API)
  - `GET /api/social/*` → `social-service:3001` (social microservice)
  - Max request body: 10 MB

---

*Integration audit: 2026-03-30*
