# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** Fluxo ponta-a-ponta de contratação de show funcionando sem erros visíveis na defesa do TCC
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-03-30 — ROADMAP.md e STATE.md inicializados

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

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Artista e banda são o mesmo conceito — `perfis_artistas` é a entidade base para qualquer performer
- Recusa automática ao aceitar — `BandApplicationService` recusa todas as outras candidaturas ao aceitar uma
- Artista confirma o contrato — dupla confirmação, contrato nasce como `aguardando_aceite`
- `nome→nome_completo` migration já aplicada — qualquer referência a `.nome` em objetos user/profile exibe `undefined`

### Pending Todos

None yet.

### Blockers/Concerns

- IP hardcoded em 5 service files bloqueia demo em qualquer outra máquina — resolvido na Phase 1
- `bandApplicationService` chama rotas erradas (404s) — resolvido na Phase 1
- Enum de status de gig no frontend diverge do backend — atenção ao filtrar eventos em BrowseEvents (Phase 2)
- Operações multi-step em ContractService/BandApplicationService sem transaction — risco de estado parcial no banco (Phase 3)

## Session Continuity

Last session: 2026-03-30
Stopped at: Roadmap inicializado. Pronto para planejar Phase 1.
Resume file: None
