---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - TocaAqui/http/RegisterService.ts
autonomous: true
requirements:
  - REQ-01

must_haves:
  truths:
    - "Every HTTP service file in TocaAqui/http/ uses the shared api instance from api.ts — no file creates its own axios instance or hardcodes a URL"
    - "App connects to backend on any machine without editing code — baseURL comes from EXPO_PUBLIC_API_URL or REACT_NATIVE_PACKAGER_HOSTNAME"
  artifacts:
    - path: "TocaAqui/http/api.ts"
      provides: "Centralized axios instance with env-based baseURL"
      contains: "EXPO_PUBLIC_API_URL"
    - path: "TocaAqui/http/RegisterService.ts"
      provides: "Registration service using shared api instance"
      contains: "import api from"
  key_links:
    - from: "TocaAqui/http/RegisterService.ts"
      to: "TocaAqui/http/api.ts"
      via: "import api from './api'"
      pattern: "import api from"
---

<objective>
Verify and enforce that all frontend HTTP service files use the centralized api.ts instance. Remove the unused direct axios import from RegisterService.ts to prevent future misuse.

Purpose: Ensures the app connects to the correct backend on any machine without code edits (REQ-01).
Output: Clean HTTP layer where every service goes through api.ts.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation/01-CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove unused axios import from RegisterService.ts and verify all services use api.ts</name>
  <files>TocaAqui/http/RegisterService.ts</files>
  <read_first>
    - TocaAqui/http/RegisterService.ts (current state — has `import axios from "axios"` on line 2 that is unused)
    - TocaAqui/http/api.ts (the centralized axios instance — source of truth)
    - TocaAqui/http/userService.ts (verify it imports api, not axios directly)
    - TocaAqui/http/bandApplicationService.ts (verify it imports api)
    - TocaAqui/http/contractService.ts (verify it imports api)
    - TocaAqui/http/establishmentService.ts (verify it imports api)
    - TocaAqui/http/artistaPublicoService.ts (verify it imports api)
  </read_first>
  <action>
    1. In `TocaAqui/http/RegisterService.ts`, remove line 2: `import axios from "axios";` — this import is unused (the file imports `api` from `./api` on line 4 and all HTTP calls go through `api`). Per D-01 (REQ-01): verify, do not rewrite.

    2. Scan every other file in `TocaAqui/http/` to confirm:
       - Each file has `import api from "./api"` (or equivalent)
       - No file has `axios.create(`, `axios.get(`, `axios.post(`, `axios.put(`, or `axios.delete(` calls
       - If any file DOES bypass api.ts, fix it to use the shared instance instead

    3. Verify `api.ts` contains the correct baseURL logic:
       ```
       const baseURL = process.env.EXPO_PUBLIC_API_URL ?? `http://${process.env.REACT_NATIVE_PACKAGER_HOSTNAME ?? "localhost"}:3000`;
       ```
       Do NOT modify api.ts — it is already correct.
  </action>
  <verify>
    <automated>cd "C:/Users/vitor/Documents/Dev/TCC - Toca Aqui/Toca-Aqui" && grep -rn "axios\.create\|axios\.get\|axios\.post\|axios\.put\|axios\.delete" TocaAqui/http/ | grep -v "api.ts" | grep -v "node_modules" ; echo "EXIT:$?"</automated>
  </verify>
  <acceptance_criteria>
    - RegisterService.ts does NOT contain `import axios from "axios"`
    - RegisterService.ts still contains `import api from "./api"`
    - No file in TocaAqui/http/ (other than api.ts) contains `axios.create`, `axios.get`, `axios.post`, `axios.put`, or `axios.delete`
    - api.ts is unchanged (still contains `EXPO_PUBLIC_API_URL`)
  </acceptance_criteria>
  <done>All HTTP service files use the centralized api.ts instance. No direct axios usage exists outside api.ts.</done>
</task>

</tasks>

<verification>
Run: `grep -rn "axios" TocaAqui/http/ | grep -v "api.ts" | grep -v "node_modules"`
Expected: No output (no axios references outside api.ts)

Run: `grep "EXPO_PUBLIC_API_URL" TocaAqui/http/api.ts`
Expected: Line with `process.env.EXPO_PUBLIC_API_URL`
</verification>

<success_criteria>
- Zero files in TocaAqui/http/ import or use axios directly (except api.ts)
- api.ts baseURL logic unchanged and functional
- REQ-01 satisfied: app connects to backend via env variable on any machine
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-01-SUMMARY.md`
</output>
