---
phase: 02-artist-application-flow
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js
  - backend-TocaAqui/src/models/BandApplicationModel.ts
  - backend-TocaAqui/src/schemas/bandApplicationSchemas.ts
  - backend-TocaAqui/src/controllers/BandApplicationController.ts
  - backend-TocaAqui/src/services/BandApplicationService.ts
  - TocaAqui/http/bandApplicationService.ts
  - TocaAqui/screens/artist/ApplyConfirmation.tsx
autonomous: true
requirements: [REQ-05]

must_haves:
  truths:
    - "Artista pode preencher valor_proposto no formulario de candidatura"
    - "Backend valida e salva valor_proposto na tabela aplicacoes_banda_evento"
    - "Candidatura sem valor_proposto e rejeitada pelo Zod schema com erro 400"
    - "applyToEvent chama a rota /candidaturas (nao /eventos)"
  artifacts:
    - path: "backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js"
      provides: "Coluna valor_proposto na tabela aplicacoes_banda_evento"
      contains: "addColumn"
    - path: "backend-TocaAqui/src/models/BandApplicationModel.ts"
      provides: "Campo valor_proposto no Sequelize model"
      contains: "valor_proposto"
    - path: "backend-TocaAqui/src/schemas/bandApplicationSchemas.ts"
      provides: "Validacao Zod de valor_proposto"
      contains: "valor_proposto"
    - path: "backend-TocaAqui/src/controllers/BandApplicationController.ts"
      provides: "Controller le valor_proposto do body"
      contains: "valor_proposto"
    - path: "backend-TocaAqui/src/services/BandApplicationService.ts"
      provides: "Service salva valor_proposto no create"
      contains: "valor_proposto"
    - path: "TocaAqui/http/bandApplicationService.ts"
      provides: "Frontend envia valor_proposto na request"
      contains: "valor_proposto: number"
    - path: "TocaAqui/screens/artist/ApplyConfirmation.tsx"
      provides: "Input de valor proposto na UI"
      contains: "valorProposto"
  key_links:
    - from: "TocaAqui/screens/artist/ApplyConfirmation.tsx"
      to: "TocaAqui/http/bandApplicationService.ts"
      via: "applyToEvent({ evento_id, mensagem, valor_proposto })"
      pattern: "applyToEvent.*valor_proposto"
    - from: "TocaAqui/http/bandApplicationService.ts"
      to: "/candidaturas"
      via: "api.post('/candidaturas', data)"
      pattern: 'api.post.*"/candidaturas"'
    - from: "backend-TocaAqui/src/services/BandApplicationService.ts"
      to: "BandApplicationModel.create"
      via: "valor_proposto passed to create in both branches"
      pattern: "valor_proposto"
---

<objective>
Implementar o fluxo completo de candidatura com valor_proposto: desde o input no frontend ate a persistencia no banco.

Purpose: REQ-05 — Artista pode se candidatar a um evento informando um valor proposto. O campo valor_proposto nao existe em nenhuma camada hoje (migration, model, schema, controller, service). Este plano adiciona a cadeia completa. Tambem corrige a rota errada do frontend (/eventos para /candidaturas).
Output: Migration criada, model atualizado, schema Zod validando, controller e service passando valor_proposto, frontend com input numerico e rota correta.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-artist-application-flow/02-CONTEXT.md
@.planning/phases/02-artist-application-flow/02-RESEARCH.md

<interfaces>
<!-- Current state of files to be modified — executor MUST read these but key signatures shown here -->

From backend-TocaAqui/src/models/BandApplicationModel.ts:
```typescript
class BandApplicationModel extends Model {
  id!: number;
  banda_id?: number;
  artista_id?: number;
  mensagem?: string;
  evento_id!: number;
  status!: ApplicationStatus;
  data_aplicacao!: Date;
  // valor_proposto is MISSING — must be added
}
// init() also missing valor_proposto field
```

From backend-TocaAqui/src/schemas/bandApplicationSchemas.ts:
```typescript
export const applyBandSchema = z.object({
  banda_id: z.number().int().positive().optional(),
  artista_id: z.number().int().positive().optional(),
  evento_id: z.number({ error: 'evento_id deve ser um numero valido' }).int().positive(),
  mensagem: z.string().max(1000).optional(),
  // valor_proposto is MISSING — must be added
});
```

From backend-TocaAqui/src/controllers/BandApplicationController.ts (applyBandToEvent):
```typescript
const { banda_id, artista_id, evento_id, mensagem } = req.body;
// valor_proposto is NOT destructured
const aplicacao = await bandApplicationService.apply(banda_id, evento_id, req.user.id, artista_id, mensagem);
// valor_proposto is NOT passed
```

From backend-TocaAqui/src/services/BandApplicationService.ts (apply):
```typescript
async apply(banda_id: number | undefined, evento_id: number, requestingUserId?: number, artista_id?: number, mensagem?: string)
// valor_proposto is NOT in signature
// Line 41: BandApplicationModel.create({ artista_id: artistaIdResolvido, evento_id, mensagem } as any);
// Line 74: BandApplicationModel.create({ banda_id, evento_id, mensagem } as any);
```

From TocaAqui/http/bandApplicationService.ts:
```typescript
const applyToEvent = async (data: { evento_id: number; artista_id?: number; mensagem: string }): Promise<BandApplication> => {
  const response = await api.post<BandApplication>("/eventos", data);  // WRONG ROUTE — must be "/candidaturas"
  return response.data;
};
```

Existing migration pattern (from 20240101000029):
```javascript
async up(queryInterface, Sequelize) {
  await queryInterface.addColumn('aplicacoes_banda_evento', 'column_name', { type: Sequelize.TYPE, allowNull: true });
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add valor_proposto column via migration and update Sequelize model, Zod schema, controller, and service</name>
  <files>
    backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js,
    backend-TocaAqui/src/models/BandApplicationModel.ts,
    backend-TocaAqui/src/schemas/bandApplicationSchemas.ts,
    backend-TocaAqui/src/controllers/BandApplicationController.ts,
    backend-TocaAqui/src/services/BandApplicationService.ts
  </files>
  <read_first>
    - backend-TocaAqui/src/migrations/20240101000029-add-artista-candidatura-fields.js
    - backend-TocaAqui/src/models/BandApplicationModel.ts
    - backend-TocaAqui/src/schemas/bandApplicationSchemas.ts
    - backend-TocaAqui/src/controllers/BandApplicationController.ts
    - backend-TocaAqui/src/services/BandApplicationService.ts
  </read_first>
  <action>
**1. Create migration file `backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js`:**

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('aplicacoes_banda_evento', 'valor_proposto', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('aplicacoes_banda_evento', 'valor_proposto');
  },
};
```

Use `allowNull: true` so existing rows are not broken. The Zod schema enforces the field as required for new candidaturas.

**2. Update `backend-TocaAqui/src/models/BandApplicationModel.ts`:**

Add class property after `data_aplicacao`:
```typescript
valor_proposto?: number;
```

Add field in `BandApplicationModel.init({...})` after the `data_aplicacao` field:
```typescript
valor_proposto: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
},
```

**3. Update `backend-TocaAqui/src/schemas/bandApplicationSchemas.ts`:**

Add `valor_proposto` to the `applyBandSchema` z.object:
```typescript
valor_proposto: z.number().positive('valor_proposto deve ser um numero positivo'),
```

This makes it required in the Zod validation (per CONTEXT.md locked decision). Place it after the `mensagem` field.

**4. Update `backend-TocaAqui/src/controllers/BandApplicationController.ts`:**

In `applyBandToEvent`, change the destructure on line 10 from:
```typescript
const { banda_id, artista_id, evento_id, mensagem } = req.body;
```
to:
```typescript
const { banda_id, artista_id, evento_id, mensagem, valor_proposto } = req.body;
```

And pass `valor_proposto` to the service call on line 11:
```typescript
const aplicacao = await bandApplicationService.apply(banda_id, evento_id, req.user.id, artista_id, mensagem, valor_proposto);
```

**5. Update `backend-TocaAqui/src/services/BandApplicationService.ts`:**

Change the `apply` method signature (line 14) to add `valor_proposto` as the last parameter:
```typescript
async apply(banda_id: number | undefined, evento_id: number, requestingUserId?: number, artista_id?: number, mensagem?: string, valor_proposto?: number)
```

Update BOTH `BandApplicationModel.create(...)` calls:

Line ~41 (artista individual branch):
```typescript
aplicacao = await BandApplicationModel.create({ artista_id: artistaIdResolvido, evento_id, mensagem, valor_proposto } as any);
```

Line ~74 (banda branch):
```typescript
aplicacao = await BandApplicationModel.create({ banda_id, evento_id, mensagem, valor_proposto } as any);
```
  </action>
  <verify>
    <automated>cd backend-TocaAqui && npx ts-node -e "import('./src/services/BandApplicationService').then(() => console.log('OK')).catch(e => { console.error(e.message); process.exit(1) })"</automated>
  </verify>
  <acceptance_criteria>
    - File backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js exists and contains `addColumn('aplicacoes_banda_evento', 'valor_proposto'`
    - BandApplicationModel.ts contains `valor_proposto?: number` as a class property
    - BandApplicationModel.ts init() contains `valor_proposto: { type: DataTypes.DECIMAL(10, 2)`
    - bandApplicationSchemas.ts contains `valor_proposto: z.number().positive(`
    - BandApplicationController.ts line destructuring req.body contains `valor_proposto`
    - BandApplicationController.ts passes `valor_proposto` as 6th argument to `bandApplicationService.apply(`
    - BandApplicationService.ts `apply` signature contains `valor_proposto?: number`
    - BandApplicationService.ts has `valor_proposto` in BOTH `BandApplicationModel.create` calls (search for two occurrences)
  </acceptance_criteria>
  <done>Backend fully supports valor_proposto from Zod validation through to database persistence in both artista and banda branches</done>
</task>

<task type="auto">
  <name>Task 2: Fix applyToEvent route and add valor_proposto input to ApplyConfirmation UI</name>
  <files>TocaAqui/http/bandApplicationService.ts, TocaAqui/screens/artist/ApplyConfirmation.tsx</files>
  <read_first>
    - TocaAqui/http/bandApplicationService.ts
    - TocaAqui/screens/artist/ApplyConfirmation.tsx
    - TocaAqui/navigation/ArtistNavigator.tsx
  </read_first>
  <action>
**1. Fix `TocaAqui/http/bandApplicationService.ts`:**

Update `applyToEvent` function signature to include `valor_proposto` as required:
```typescript
const applyToEvent = async (data: { evento_id: number; artista_id?: number; mensagem: string; valor_proposto: number }): Promise<BandApplication> => {
  const response = await api.post<BandApplication>("/candidaturas", data);
  return response.data;
};
```

Two changes:
- Route: `"/eventos"` changed to `"/candidaturas"` (matches BandApplicationRoutes.ts `router.post("/")` mounted at `/candidaturas`)
- Type: added `valor_proposto: number` (required, not optional) to the data parameter

**2. Update `TocaAqui/screens/artist/ApplyConfirmation.tsx`:**

Add state for valor proposto near other useState declarations:
```typescript
const [valorProposto, setValorProposto] = useState("");
```

Add a `TextInput` for valor proposto in the form, BEFORE the submit button, AFTER the mensagem input. Use the same styling pattern as the mensagem TextInput but with these props:
```typescript
<Text style={styles.label}>Valor proposto (R$)</Text>
<TextInput
  style={styles.input}
  placeholder="Ex: 350"
  placeholderTextColor={DS.textDis}
  keyboardType="numeric"
  value={valorProposto}
  onChangeText={setValorProposto}
/>
```

Note: If there is no `styles.label` in the file, use the same style as the label for the mensagem field. If there is no label, add one with `{ color: DS.text, fontSize: 14, marginBottom: 6, fontWeight: '600' }`.

In the submit handler (the function that calls `bandApplicationService.applyToEvent`), add validation BEFORE the API call:
```typescript
const valorNum = parseFloat(valorProposto);
if (!valorProposto.trim() || isNaN(valorNum) || valorNum <= 0) {
  Alert.alert("Atencao", "Informe um valor proposto valido.");
  return;
}
```

Update the payload passed to `applyToEvent` to include `valor_proposto`:
```typescript
await bandApplicationService.applyToEvent({
  evento_id: eventId,
  mensagem: mensagem.trim(),
  valor_proposto: valorNum,
});
```

IMPORTANT: `parseFloat` converts the string from TextInput to a number. This avoids the Zod `z.number()` rejection of string values (Pitfall 2 from research).
  </action>
  <verify>
    <automated>cd TocaAqui && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <acceptance_criteria>
    - bandApplicationService.ts contains `api.post<BandApplication>("/candidaturas"` (NOT "/eventos")
    - bandApplicationService.ts `applyToEvent` data type contains `valor_proposto: number`
    - ApplyConfirmation.tsx contains `useState("")` for valorProposto
    - ApplyConfirmation.tsx contains `keyboardType="numeric"` on the valor TextInput
    - ApplyConfirmation.tsx contains `parseFloat(valorProposto)` before the API call
    - ApplyConfirmation.tsx contains `valor_proposto: valorNum` in the applyToEvent payload
    - ApplyConfirmation.tsx contains `placeholder="Ex: 350"` on the input
  </acceptance_criteria>
  <done>Frontend sends valor_proposto as a number to /candidaturas route; user sees labeled numeric input field</done>
</task>

</tasks>

<verification>
- Migration file exists with correct addColumn for valor_proposto DECIMAL(10,2)
- All 5 backend layers have valor_proposto: migration, model, schema, controller, service
- Frontend calls /candidaturas (not /eventos) with valor_proposto in payload
- ApplyConfirmation has numeric input with validation before submit
- TypeScript compiles without errors
</verification>

<success_criteria>
- Artista can fill in valor_proposto and submit candidatura
- Backend validates valor_proposto > 0 via Zod and saves to DB
- Route is /candidaturas (not /eventos)
- Submitting without valor_proposto shows alert
</success_criteria>

<output>
After completion, create `.planning/phases/02-artist-application-flow/02-02-apply-to-gig-SUMMARY.md`
</output>
