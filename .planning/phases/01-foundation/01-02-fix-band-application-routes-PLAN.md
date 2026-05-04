---
phase: 01-foundation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - TocaAqui/http/bandApplicationService.ts
autonomous: true
requirements:
  - REQ-01
  - REQ-02

must_haves:
  truths:
    - "bandApplicationService routes match backend BandApplicationRoutes.ts — no 404s on any call"
    - "getApplicationsByEvent returns BandApplication[] whether event is open or closed (handles { closed: true, candidaturas: [...] } response)"
    - "BandApplication interface includes valor_proposto field for Phase 2 readiness"
    - "acceptApplication and rejectApplication stubs exist for Phase 3 readiness"
  artifacts:
    - path: "TocaAqui/http/bandApplicationService.ts"
      provides: "Frontend HTTP client for band application endpoints"
      exports: ["BandApplication", "bandApplicationService"]
      contains: "valor_proposto"
  key_links:
    - from: "TocaAqui/http/bandApplicationService.ts"
      to: "backend-TocaAqui/src/routes/BandApplicationRoutes.ts"
      via: "HTTP path alignment"
      pattern: "/eventos"
---

<objective>
Fix the bandApplicationService to correctly handle all backend response shapes, add the missing `valor_proposto` field to the BandApplication interface, and add accept/reject stubs for Phase 3.

Purpose: Ensures listing screens display real data instead of empty lists caused by broken response handling (REQ-01, REQ-02).
Output: A fully aligned bandApplicationService.ts ready for Phases 2 and 3.
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

<interfaces>
<!-- Backend routes mounted at /eventos (from backend-TocaAqui/src/index.ts) -->

From backend-TocaAqui/src/routes/BandApplicationRoutes.ts:
```typescript
router.post("/", validate(applyBandSchema), applyBandToEvent);          // POST /eventos
router.get("/minhas", getMyApplications);                                // GET /eventos/minhas
router.get("/:evento_id", getBandApplicationsForEvent);                  // GET /eventos/:evento_id
router.put("/:id/aceitar", checkEventOwnership, acceptBandApplication);  // PUT /eventos/:id/aceitar
router.put("/:id/recusar", checkEventOwnership, rejectBandApplication);  // PUT /eventos/:id/recusar
```

Backend getBandApplicationsForEvent returns TWO possible shapes:
1. Open event: `BandApplication[]` (array directly)
2. Closed event: `{ closed: true, message: string, candidaturas: BandApplication[] }` (object with array inside)

Current frontend getApplicationsByEvent does `return response.data` which breaks when shape is #2.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add valor_proposto to interface and fix getApplicationsByEvent response handling</name>
  <files>TocaAqui/http/bandApplicationService.ts</files>
  <read_first>
    - TocaAqui/http/bandApplicationService.ts (current state — interface missing valor_proposto, getApplicationsByEvent doesn't handle closed event response)
    - backend-TocaAqui/src/routes/BandApplicationRoutes.ts (source of truth for route paths)
    - backend-TocaAqui/src/controllers/BandApplicationController.ts (to confirm exact response shapes)
    - backend-TocaAqui/src/services/BandApplicationService.ts (to confirm closed-event response structure)
  </read_first>
  <action>
    Edit `TocaAqui/http/bandApplicationService.ts`:

    1. **Add `valor_proposto` to `BandApplication` interface** (after `cache_maximo?: number;`):
       ```typescript
       valor_proposto?: number;
       ```

    2. **Fix `getApplicationsByEvent`** to handle both response shapes:
       Replace the current function body:
       ```typescript
       const getApplicationsByEvent = async (evento_id: number): Promise<BandApplication[]> => {
         const response = await api.get(`/eventos/${evento_id}`);
         const data = response.data;
         // Backend returns array when event is open, or { closed, candidaturas } when closed
         if (Array.isArray(data)) {
           return data;
         }
         if (data && Array.isArray(data.candidaturas)) {
           return data.candidaturas;
         }
         return [];
       };
       ```

    3. **Add `acceptApplication` stub** (after getMyApplications):
       ```typescript
       const acceptApplication = async (applicationId: number): Promise<BandApplication> => {
         const response = await api.put<BandApplication>(`/eventos/${applicationId}/aceitar`);
         return response.data;
       };
       ```

    4. **Add `rejectApplication` stub** (after acceptApplication):
       ```typescript
       const rejectApplication = async (applicationId: number): Promise<BandApplication> => {
         const response = await api.put<BandApplication>(`/eventos/${applicationId}/recusar`);
         return response.data;
       };
       ```

    5. **Add both to the exported object**:
       ```typescript
       export const bandApplicationService = {
         applyToEvent,
         getApplicationsByEvent,
         getMyApplications,
         acceptApplication,
         rejectApplication,
       };
       ```

    Important: Do NOT change the route paths for applyToEvent (`/eventos`), getApplicationsByEvent (`/eventos/${evento_id}`), or getMyApplications (`/eventos/minhas`) — they are already correct and aligned with the backend.
  </action>
  <verify>
    <automated>cd "C:/Users/vitor/Documents/Dev/TCC - Toca Aqui/Toca-Aqui" && grep -n "valor_proposto" TocaAqui/http/bandApplicationService.ts && grep -n "candidaturas" TocaAqui/http/bandApplicationService.ts && grep -n "acceptApplication\|rejectApplication" TocaAqui/http/bandApplicationService.ts && grep -n "aceitar\|recusar" TocaAqui/http/bandApplicationService.ts</automated>
  </verify>
  <acceptance_criteria>
    - bandApplicationService.ts BandApplication interface contains `valor_proposto?: number`
    - getApplicationsByEvent function body contains `Array.isArray(data)` check
    - getApplicationsByEvent function body contains `data.candidaturas` extraction
    - File contains `const acceptApplication` function that calls `/eventos/${applicationId}/aceitar`
    - File contains `const rejectApplication` function that calls `/eventos/${applicationId}/recusar`
    - Exported object contains all 5 methods: applyToEvent, getApplicationsByEvent, getMyApplications, acceptApplication, rejectApplication
    - Route paths remain: POST `/eventos`, GET `/eventos/${evento_id}`, GET `/eventos/minhas`, PUT `/eventos/${applicationId}/aceitar`, PUT `/eventos/${applicationId}/recusar`
  </acceptance_criteria>
  <done>bandApplicationService.ts has correct response handling for closed events, valor_proposto in the interface, and accept/reject stubs ready for Phase 3.</done>
</task>

</tasks>

<verification>
Run: `grep -c "valor_proposto" TocaAqui/http/bandApplicationService.ts`
Expected: At least 1 (in interface)

Run: `grep "candidaturas" TocaAqui/http/bandApplicationService.ts`
Expected: Line handling `data.candidaturas` in getApplicationsByEvent

Run: `grep "aceitar\|recusar" TocaAqui/http/bandApplicationService.ts`
Expected: Two lines with the PUT route paths
</verification>

<success_criteria>
- getApplicationsByEvent handles both array and { closed, candidaturas } response shapes
- BandApplication interface has valor_proposto field
- acceptApplication and rejectApplication stubs exist with correct PUT paths
- All route paths match backend BandApplicationRoutes.ts exactly
- REQ-01 (routes aligned) and REQ-02 (listing screens get real data) addressed
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-02-SUMMARY.md`
</output>
