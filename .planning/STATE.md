---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 02-artist-application-flow 02-02-apply-to-gig-PLAN.md
last_updated: "2026-04-02T03:07:45.849Z"
last_activity: 2026-04-02
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 6
  completed_plans: 5
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** Fluxo ponta-a-ponta de contratação de show funcionando sem erros visíveis na defesa do TCC
**Current focus:** Phase 02 — artist-application-flow

## Current Position

Phase: 02 (artist-application-flow) — EXECUTING
Plan: 3 of 3
Status: Ready to execute
Last activity: 2026-04-02

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P03 | 5 | 2 tasks | 2 files |
| Phase 01-foundation P01 | 5 | 1 tasks | 2 files |
| Phase 02 P01 | 5 | 2 tasks | 3 files |
| Phase 02-artist-application-flow P02 | 15 | 2 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Artista e banda são o mesmo conceito — `perfis_artistas` é a entidade base para qualquer performer
- Recusa automática ao aceitar — `BandApplicationService` recusa todas as outras candidaturas ao aceitar uma
- Artista confirma o contrato — dupla confirmação, contrato nasce como `aguardando_aceite`
- `nome→nome_completo` migration já aplicada — qualquer referência a `.nome` em objetos user/profile exibe `undefined`
- [Phase 01]: Use ArtistStackParamList from ArtistNavigator.tsx for artist screen navigation types — not RootStackParamList from Navigate.tsx
- [Phase 01-foundation]: HTTP services use named import isAxiosError from axios for error type narrowing — never default axios import
- [Phase 02]: Server-side status filter preferred over client-side for correctness — getBookings accepts params and backend filters by status query param
- [Phase 02]: valor_proposto obrigatorio no Zod schema — artista deve informar valor ao se candidatar (REQ-05)
- [Phase 02]: parseFloat no frontend antes de enviar numero ao backend — z.number() rejeita strings de TextInput

### Pending Todos

None yet.

### Blockers/Concerns

- IP hardcoded em 5 service files bloqueia demo em qualquer outra máquina — resolvido na Phase 1
- `bandApplicationService` chama rotas erradas (404s) — resolvido na Phase 1
- Enum de status de gig no frontend diverge do backend — atenção ao filtrar eventos em BrowseEvents (Phase 2)
- Operações multi-step em ContractService/BandApplicationService sem transaction — risco de estado parcial no banco (Phase 3)

## Session Continuity

Last session: 2026-04-02T03:07:45.845Z
Stopped at: Completed 02-artist-application-flow 02-02-apply-to-gig-PLAN.md
Resume file: None
