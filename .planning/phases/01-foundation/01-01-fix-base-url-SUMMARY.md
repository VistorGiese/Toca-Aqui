---
phase: 01-foundation
plan: 01
subsystem: api
tags: [axios, react-native, expo, http, env-config]

# Dependency graph
requires: []
provides:
  - Centralized axios instance in api.ts with env-based baseURL (EXPO_PUBLIC_API_URL / REACT_NATIVE_PACKAGER_HOSTNAME)
  - All HTTP service files verified to use shared api instance — no direct axios HTTP calls outside api.ts
affects:
  - 02-band-application
  - 03-navigation
  - All frontend HTTP service consumers

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All HTTP calls go through TocaAqui/http/api.ts shared axios instance"
    - "Named import { isAxiosError } from 'axios' for error type narrowing — no default axios import in service files"

key-files:
  created: []
  modified:
    - TocaAqui/http/api.ts
    - TocaAqui/http/RegisterService.ts

key-decisions:
  - "Keep isAxiosError for error type narrowing via named import { isAxiosError } from 'axios' — keeps error logging while removing default axios import"
  - "api.ts uses EXPO_PUBLIC_API_URL ?? http://${REACT_NATIVE_PACKAGER_HOSTNAME ?? localhost}:3000 — works on any machine without code edits"

patterns-established:
  - "HTTP services import api from './api' and isAxiosError from 'axios' — never import default axios"

requirements-completed: [REQ-01]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 01 Plan 01: Fix Base URL Summary

**Centralized axios HTTP layer with env-based baseURL in api.ts, removing hardcoded IP and direct axios default import from RegisterService.ts**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-01T16:33:00Z
- **Completed:** 2026-04-01T16:36:16Z
- **Tasks:** 1 of 1
- **Files modified:** 2

## Accomplishments

- api.ts now uses `EXPO_PUBLIC_API_URL ?? http://${REACT_NATIVE_PACKAGER_HOSTNAME ?? "localhost"}:3000` — no hardcoded IP
- RegisterService.ts no longer uses `import axios from "axios"` — uses named `{ isAxiosError }` import only
- All 5 other service files (userService, bandApplicationService, contractService, establishmentService, artistaPublicoService) confirmed to import only from `./api`
- Zero direct `axios.get/post/put/delete` calls outside api.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove unused axios import from RegisterService.ts and verify all services use api.ts** - `b8853bb` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `TocaAqui/http/api.ts` - Env-based baseURL replacing hardcoded IP; centralized axios instance with auth interceptor
- `TocaAqui/http/RegisterService.ts` - Replaced `import axios from "axios"` with `import { isAxiosError } from "axios"`; all HTTP calls go through `api`

## Decisions Made

- Kept `isAxiosError` for error type narrowing via named import — the plan described the axios import as "unused" but `axios.isAxiosError` was being used in error handlers. Correct fix is named import, not removal.
- Did NOT modify api.ts env logic — it was already correct in the worktree (env-based URL was the target state).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] axios import was not fully unused — replaced with named { isAxiosError } import**
- **Found during:** Task 1 (RegisterService.ts inspection)
- **Issue:** Plan said `import axios from "axios"` was "unused" but `axios.isAxiosError(error)` was called in 5 error handlers. Simple removal would break error logging.
- **Fix:** Changed `import axios from "axios"` to `import { isAxiosError } from "axios"` and updated all `axios.isAxiosError(error)` calls to `isAxiosError(error)`. Satisfies acceptance criteria (no default axios import) while preserving functionality.
- **Files modified:** TocaAqui/http/RegisterService.ts
- **Verification:** `grep -rn "axios\.create\|axios\.get\|axios\.post\|axios\.put\|axios\.delete" TocaAqui/http/ | grep -v api.ts` — no output (clean)
- **Committed in:** b8853bb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug: incorrect description of unused import)
**Impact on plan:** Fix was necessary for correctness. No scope creep. Acceptance criteria fully satisfied.

## Issues Encountered

- Worktree branch (`worktree-agent-a528ec76`) did not contain `TocaAqui/http/` directory — branch predates the frontend HTTP work. Resolved by checking out files from `front-test-stitch` branch before applying fixes.

## User Setup Required

None — no external service configuration required. Set `EXPO_PUBLIC_API_URL` in `TocaAqui/.env` if backend runs on a non-standard host/port.

## Next Phase Readiness

- HTTP layer is clean and machine-agnostic
- Ready for Plan 02: fix band application routes (bandApplicationService route corrections)
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-04-01*

## Self-Check: PASSED

- `TocaAqui/http/api.ts` — FOUND in worktree
- `TocaAqui/http/RegisterService.ts` — FOUND in worktree, no `import axios from "axios"` present
- Commit `b8853bb` — FOUND
