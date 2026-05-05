# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Setup

**Config file:** `backend-TocaAqui/jest.config.ts`

Key settings:
- `preset: 'ts-jest'`
- `testEnvironment: 'node'`
- `roots: ['<rootDir>/src/__tests__']`

**All test files live in a single flat directory:**
`backend-TocaAqui/src/__tests__/` — 29 test files, no subdirectories.

---

## Test Frameworks

**Runner:** Jest (via `ts-jest` transformer)
- TypeScript compiled inline by ts-jest — no separate build step needed

**Assertion library:** Jest built-in (`expect`)

**Mocking:** Jest built-in (`jest.fn()`, `jest.mock()`, `jest.spyOn()`)

**Run commands:**
```bash
cd backend-TocaAqui

npm test                               # Run all tests once
npm test -- --watch                    # Watch mode
npm test -- --coverage                 # Generate coverage report
npm test -- BandApplication            # Run tests matching pattern
npm test -- --testPathPattern=Service  # Run only service tests
```

---

## What Is Tested

**Backend only.** 29 test files cover:

| Layer | Domain examples |
|---|---|
| Controllers | BandApplicationController, BookingController, UserController |
| Services | BandApplicationService, ContractService |
| Models | ArtistProfileModel, EstablishmentProfileModel, associations |
| Routes | BandApplicationRoutes, NotificationRoutes, UserRoutes |
| Schemas | bandApplicationSchemas, bookingSchemas |
| Middleware | rateLimiter |

Domain areas with coverage: band applications, bookings/contracts, user management, artist profiles, establishment profiles, notifications.

---

## What Is NOT Tested

**Frontend: zero test files.** The entire `TocaAqui/` React Native app has no test suite.

Specifically untested:
- All screens in `TocaAqui/screens/`
- All service functions in `TocaAqui/http/`
- Navigation logic in `TocaAqui/navigation/`
- `AuthContext` in `TocaAqui/contexts/AuthContext.tsx`
- Form validation rules in react-hook-form `Controller` components
- Any UI component in `TocaAqui/components/`

Backend gaps:
- Cron jobs in `backend-TocaAqui/src/jobs/` — no test files
- Integration tests against a real database — tests mock the DB layer

---

## Test Patterns

**Reusable factory helpers:**
```typescript
// Mock Express response object
const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mock Express request
const makeReq = (overrides = {}): Partial<Request> => ({
  body: {},
  params: {},
  user: makeUser(),
  ...overrides,
});

// User fixture
const makeUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  tipo: 'artista',
  ...overrides,
});

// Band application fixture
const makeAplicacao = (overrides = {}) => ({
  id: 1,
  artistaId: 1,
  gigId: 10,
  status: 'pendente',
  mensagem: 'Quero tocar no evento',
  ...overrides,
});
```

**Controller test pattern:**
```typescript
describe('BandApplicationController', () => {
  it('should return 201 with created application', async () => {
    const aplicacao = makeAplicacao();
    jest.spyOn(bandApplicationService, 'create').mockResolvedValue(aplicacao);

    const req = makeReq({ body: { gigId: 10, mensagem: 'Quero tocar' } });
    const res = mockRes();

    await bandApplicationController.create(req as Request, res as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(aplicacao);
  });
});
```

**Service test pattern:**
```typescript
describe('BandApplicationService', () => {
  it('should create application when gig exists', async () => {
    jest.spyOn(GigModel, 'findByPk').mockResolvedValue(makeGig() as any);
    jest.spyOn(BandApplicationModel, 'create').mockResolvedValue(makeAplicacao() as any);

    const result = await bandApplicationService.create(payload, userId);

    expect(result).toMatchObject({ status: 'pendente' });
  });
});
```

**Schema test pattern:**
```typescript
describe('bandApplicationSchemas', () => {
  it('should accept valid payload', () => {
    const result = createApplicationSchema.safeParse({ gigId: 1, mensagem: 'Ola' });
    expect(result.success).toBe(true);
  });

  it('should reject missing gigId', () => {
    const result = createApplicationSchema.safeParse({ mensagem: 'Ola' });
    expect(result.success).toBe(false);
  });
});
```

**Error testing:**
```typescript
it('should throw 404 when not found', async () => {
  jest.spyOn(Model, 'findByPk').mockResolvedValue(null);

  await expect(service.getById(999)).rejects.toThrow(AppError);
  await expect(service.getById(999)).rejects.toMatchObject({ statusCode: 404 });
});
```

All async tests use `async/await`. No done callbacks. No `.then()` chains in tests.

---

## Coverage Status

**No coverage thresholds enforced** — `jest.config.ts` has no `coverageThreshold` setting.

Coverage report outputs to `backend-TocaAqui/coverage/` (not committed).

Known gaps:
- Frontend: 0% (no test infrastructure)
- Cron jobs (`src/jobs/`): no test files
- No E2E or integration tests against a live DB

---

## How to Run Tests

```bash
# All backend tests
cd backend-TocaAqui && npm test

# Single file
cd backend-TocaAqui && npm test -- BandApplicationService

# Watch mode during development
cd backend-TocaAqui && npm test -- --watch

# Coverage report
cd backend-TocaAqui && npm test -- --coverage
```

**Frontend tests:** Not available. No test runner configured in `TocaAqui/`.

To add frontend testing in the future:
- `jest-expo` preset
- `@testing-library/react-native` for component testing
- Co-locate test files: `screens/artist/BrowseEvents.test.tsx`
