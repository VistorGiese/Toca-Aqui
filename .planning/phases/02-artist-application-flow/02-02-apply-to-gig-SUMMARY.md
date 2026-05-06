---
phase: 02-artist-application-flow
plan: 02
subsystem: api
tags: [sequelize, zod, react-native, typescript, candidatura, valor_proposto]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: HTTP layer centralizado, bandApplicationService com rotas alinhadas ao backend
provides:
  - Migration DECIMAL(10,2) valor_proposto em aplicacoes_banda_evento
  - Cadeia completa valor_proposto: migration → model → schema Zod → controller → service → frontend
  - Rota correta /candidaturas no frontend (era /eventos)
  - Input numerico com validacao antes do submit na ApplyConfirmation
affects:
  - 02-03-gig-applications-review
  - 03-contract-flow

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zod schema com campo requerido (valor_proposto) para novos recursos — campos opcionais para retro-compatibilidade de dados existentes
    - parseFloat antes de enviar numero de TextInput para API — evita rejeicao z.number() de strings

key-files:
  created:
    - backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js
  modified:
    - backend-TocaAqui/src/models/BandApplicationModel.ts
    - backend-TocaAqui/src/schemas/bandApplicationSchemas.ts
    - backend-TocaAqui/src/controllers/BandApplicationController.ts
    - backend-TocaAqui/src/services/BandApplicationService.ts
    - TocaAqui/http/bandApplicationService.ts
    - TocaAqui/screens/artist/ApplyConfirmation.tsx

key-decisions:
  - "valor_proposto obrigatorio no Zod schema — artista deve sempre informar um valor para se candidatar"
  - "allowNull: true na migration — rows existentes nao sao quebradas, Zod enforced na camada de aplicacao"
  - "parseFloat no frontend converte string do TextInput antes de enviar — z.number() no backend rejeita strings"

patterns-established:
  - "Novo campo em candidatura: migration (allowNull:true) + model + schema + controller + service + UI, nessa ordem"

requirements-completed: [REQ-05]

# Metrics
duration: 15min
completed: 2026-04-02
---

# Phase 02 Plan 02: Apply to Gig Summary

**valor_proposto adicionado em toda a cadeia — migration DECIMAL(10,2), Zod requerido, dois BandApplicationModel.create atualizados e input numerico com validacao no ApplyConfirmation**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-02T00:00:00Z
- **Completed:** 2026-04-02T00:15:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Migration 20240101000032 cria coluna DECIMAL(10,2) valor_proposto em aplicacoes_banda_evento com allowNull para retro-compatibilidade
- Cadeia backend completa: model, schema Zod (requerido, positivo), controller (destructure + repasse), service (assinatura + ambos os create)
- Frontend: rota corrigida de /eventos para /candidaturas; tipo applyToEvent inclui valor_proposto: number; UI com label, TextInput numerico e validacao antes do submit

## Task Commits

Each task was committed atomically:

1. **Task 1: Add valor_proposto to full backend stack** - `30c15ee` (feat)
2. **Task 2: Fix applyToEvent route and add valor_proposto to ApplyConfirmation UI** - `2420218` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `backend-TocaAqui/src/migrations/20240101000032-add-valor-proposto-to-aplicacoes.js` - Adiciona coluna DECIMAL(10,2) valor_proposto na tabela aplicacoes_banda_evento
- `backend-TocaAqui/src/models/BandApplicationModel.ts` - Classe e init() com valor_proposto?: number e DECIMAL(10,2)
- `backend-TocaAqui/src/schemas/bandApplicationSchemas.ts` - applyBandSchema com valor_proposto requerido e positivo
- `backend-TocaAqui/src/controllers/BandApplicationController.ts` - Destructure e repasse de valor_proposto para o service
- `backend-TocaAqui/src/services/BandApplicationService.ts` - Assinatura apply() com valor_proposto; ambos BandApplicationModel.create persistem o campo
- `TocaAqui/http/bandApplicationService.ts` - Rota corrigida /eventos→/candidaturas; tipo inclui valor_proposto: number
- `TocaAqui/screens/artist/ApplyConfirmation.tsx` - Estado valorProposto, TextInput numerico com placeholder "Ex: 350", validacao parseFloat, payload com valor_proposto

## Decisions Made
- `valor_proposto` requerido no Zod schema (sem `.optional()`) — artista deve sempre informar um valor para se candidatar, conforme REQ-05
- `allowNull: true` na migration para nao quebrar rows existentes; a obrigatoriedade e garantida pelo Zod na camada de aplicacao
- `parseFloat` no frontend antes de enviar — z.number() rejeita strings automaticamente, este padrao previne erros 400

## Deviations from Plan

None — plan executed exactly as written. Os arquivos de backend (model, schema, controller, service) ja tinham valor_proposto parcialmente aplicado de trabalho anterior; apenas as duas chamadas `BandApplicationModel.create` estavam faltando e foram corrigidas como planejado.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Candidatura com valor_proposto esta funcional ponta-a-ponta: artista preenche o valor na UI, frontend valida e envia para /candidaturas, backend valida via Zod e persiste no banco
- Proximos passos: 02-03 revisao de candidaturas pelo estabelecimento (ver valor_proposto nas candidaturas listadas)
- Nenhum bloqueador identificado

---
*Phase: 02-artist-application-flow*
*Completed: 2026-04-02*
