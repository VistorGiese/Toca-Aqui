# Coding Conventions

**Analysis Date:** 2026-03-30

## Language & TypeScript Usage

**Both frontend and backend use TypeScript in strict mode.**

Frontend (`TocaAqui/tsconfig.json`):
- `strict: true`
- `baseUrl: "."`
- Path alias `@/*` maps to `./*` — use this for all cross-directory imports
- Target: ESNext, module: ESNext, JSX: react-jsx

Backend (`backend-TocaAqui/tsconfig.json`):
- `strict: true`
- `esModuleInterop: true`
- Target: ES2020, module: CommonJS
- No path aliases — use relative imports

**Type definitions:**
- Shared frontend types live in `TocaAqui/types/index.ts` — add new shared types here
- Backend model types are inferred from Sequelize model definitions in `backend-TocaAqui/src/models/`
- Avoid `any` casts; prefer explicit types

---

## Naming Conventions

**Files:**
- Frontend components: PascalCase — `BrowseEvents.tsx`, `EstSchedule.tsx`
- Frontend screens follow a prefix convention:
  - Establishment screens: `Est` prefix — `EstNewGig.tsx`, `EstSchedule.tsx`, `EstRateArtist.tsx`
  - Artist screens: descriptive name, no prefix — `BrowseEvents.tsx`, `MyApplications.tsx`
  - Common-user screens: `User` prefix — `UserSettings.tsx`
- Frontend service files: camelCase — `bandApplicationService.ts`, `contractService.ts`
- Backend files: PascalCase with role suffix — `BandApplicationController.ts`, `BandApplicationService.ts`, `BandApplicationRoutes.ts`, `ArtistProfileModel.ts`
- Backend schema files: camelCase with `Schemas` suffix — `bandApplicationSchemas.ts`, `bookingSchemas.ts`
- Backend test files: match source file name + `.test.ts` — `BandApplicationService.test.ts`

**Functions & methods:**
- camelCase everywhere: `getArtistProfile`, `createBandApplication`, `handleSubmit`
- React components: PascalCase — `BrowseEvents`, `EstNewGig`
- Boolean variables/props: `is`/`has` prefix — `isLoading`, `hasError`

**Variables:**
- camelCase — `artistaId`, `nomeCompleto`, `dataEvento`
- Constants: camelCase (not SCREAMING_SNAKE_CASE) unless truly global config

**Types & Interfaces:**
- PascalCase — `BandApplication`, `ArtistProfile`, `ContractStatus`
- No `I` prefix on interfaces

---

## File Organization

**Frontend (`TocaAqui/`):**
```
TocaAqui/
├── app/             # Root App component and navigation setup
├── assets/          # Static images and fonts
├── components/      # Reusable UI components (shared across screens)
├── contexts/        # React Context providers (AuthContext.tsx)
├── http/            # API service layer — one file per domain
├── navigation/      # React Navigation stack/tab navigators
├── screens/         # Screens grouped by role: artist/, establishment/, user/
└── types/           # Shared TypeScript types (index.ts)
```

**Backend (`backend-TocaAqui/src/`):**
```
src/
├── controllers/     # Request handlers — thin, delegate to services
├── middleware/      # Express middleware (auth, rateLimiter, errorHandler)
├── models/          # Sequelize models + associations.ts
├── routes/          # Express routers — one file per domain
├── schemas/         # Zod validation schemas
├── services/        # Business logic — one class per domain
├── utils/           # Shared utilities (AppError, asyncHandler, jwt)
└── __tests__/       # All test files live here (flat directory)
```

**Imports — Frontend:**
- Use `@/` alias for non-adjacent modules: `import { AuthContext } from '@/contexts/AuthContext'`
- Relative paths only for files in the same directory

**Imports — Backend:**
- Relative paths throughout: `import { AppError } from '../errors/AppError'`
- Group order: Node built-ins → third-party → internal

---

## Component Patterns (Frontend)

**Screen component structure:**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { bandApplicationService } from '@/http/bandApplicationService';

// 2. Type definitions (props interface if needed)
interface Props { ... }

// 3. Component function — arrow function, exported as default
const BrowseEvents = () => {
  // 3a. Hooks
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // 3b. Effects
  useEffect(() => { ... }, []);

  // 3c. Handlers (prefixed with handle)
  const handlePress = () => { ... };

  // 3d. Render
  return ( ... );
};

export default BrowseEvents;

// 4. Styles at the BOTTOM of the file — always last
const s = StyleSheet.create({
  container: { flex: 1 },
});
```

**Styles convention:**
- Variable named `s` with `StyleSheet.create({})` — `s.container`, `s.title`
- Design-system objects use `DS` — `const DS = { colors: {...}, spacing: {...} }`
- Styles are always defined at the bottom of the file, never inline in JSX except for one-off dynamic values

**Forms — react-hook-form:**
```typescript
const { control, handleSubmit, formState: { errors } } = useForm({
  mode: 'onTouched',
});

// Fields always use Controller component with inline rules:
<Controller
  control={control}
  name="email"
  rules={{ required: 'Campo obrigatório', pattern: { value: /.../, message: '...' } }}
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput onChangeText={onChange} onBlur={onBlur} value={value} />
  )}
/>
```

**API calls in screens:**
- Call service methods inside `useEffect` or handlers
- Always wrap in try/catch; set loading state around async calls
- Services imported from `@/http/[domain]Service`

**Service files (`TocaAqui/http/`):**
```typescript
// Single exported object literal — not a class
const bandApplicationService = {
  async getApplications(artistaId: number) {
    const response = await api.get(`/aplicacoes/${artistaId}`);
    return response.data;
  },
  async apply(payload: ApplyPayload) {
    const response = await api.post('/aplicacoes', payload);
    return response.data;
  },
};

export { bandApplicationService };
```

---

## API Patterns (Backend)

**Controller pattern — thin, always use asyncHandler:**
```typescript
import { asyncHandler } from '../middleware/errorHandler';

class BandApplicationController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await bandApplicationService.create(req.body, req.user!.id);
    res.status(201).json(data);
  });
}

export const bandApplicationController = new BandApplicationController();
```

**Service pattern — class + exported singleton:**
```typescript
class BandApplicationService {
  async create(payload: CreateApplicationDTO, userId: number) {
    // business logic here
  }
}

export const bandApplicationService = new BandApplicationService();
```

**Request validation — Zod schemas:**
```typescript
// In schemas/bandApplicationSchemas.ts
export const createApplicationSchema = z.object({
  gigId: z.number().positive(),
  mensagem: z.string().min(10).max(500),
});

// Applied in route via validate middleware:
router.post('/', validate(createApplicationSchema), bandApplicationController.create);
```

**Route files — express Router, grouped by domain:**
```typescript
const router = Router();
router.use(authMiddleware); // auth applied at router level
router.post('/', validate(schema), controller.create);
router.get('/:id', controller.get);
export default router;
```

---

## Error Handling

**Backend — AppError class:**
```typescript
// Throw domain errors from services:
throw new AppError('Aplicação não encontrada', 404);
```

- `asyncHandler` catches all thrown errors and forwards to Express error middleware
- Global error handler in `backend-TocaAqui/src/middleware/errorHandler.ts` formats the response
- Never `res.status(500).json(...)` directly in controllers — always throw AppError

**Frontend — try/catch in handlers:**
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    await bandApplicationService.apply(data);
    navigation.navigate('ApplyConfirmation');
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível enviar a aplicação.');
  } finally {
    setLoading(false);
  }
};
```

- Use `Alert.alert` for user-facing errors in React Native screens
- No global error boundary currently in place

---

## Comments & Documentation

**Language:** All comments are written in Portuguese — maintain this convention.

**When to comment:**
- Section dividers in long files to separate logical blocks
- Brief inline comments for non-obvious business logic
- No JSDoc / TSDoc annotations anywhere in the codebase

**Section divider style:**
```typescript
// ─────────────────────────────────────────
// Validações
// ─────────────────────────────────────────
```

**What not to comment:**
- Self-explanatory code
- Function signatures (no JSDoc)
- Type definitions
