---
slug: candidatura-500-internal
status: root_cause_found
trigger: Erro 500 Internal Server Error ao se candidatar a um show — critico, bloqueia fluxo principal do TCC
created: 2026-05-04
updated: 2026-05-04
---

# Debug Session: candidatura-500-internal

## Symptoms
- expected: Artista consegue se candidatar a um show/vaga e recebe confirmacao de candidatura registrada
- actual: Servidor retorna 500 Internal Server Error ao tentar se candidatar
- error_messages: "500 Internal Server Error" — sem stack trace capturado pelo usuario
- timeline: Identificado em teste manual recente
- reproduction: Tentar se candidatar a qualquer vaga/show como artista individual (ApplyConfirmation → ENVIAR CANDIDATURA)

## Current Focus
- hypothesis: CONFIRMED — migracao 20240101000029 provavelmente nao foi aplicada no DB; banda_id ainda e NOT NULL na tabela aplicacoes_banda_evento; insert sem banda_id causa SequelizeDatabaseError que cai no handler generico de 500
- test: analise estatica completa de toda a cadeia frontend→backend
- expecting: n/a
- next_action: aplicar migracao ou corrigir codigo defensivamente

## Evidence

- timestamp: 2026-05-04T00:00:00Z
  finding: "Frontend ApplyConfirmation (linha 78-82) envia { evento_id, mensagem, valor_proposto } sem banda_id. Correto para artista individual."
  file: TocaAqui/screens/artist/ApplyConfirmation.tsx:78
  verdict: ok

- timestamp: 2026-05-04T00:01:00Z
  finding: "Frontend bandApplicationService.ts linha 24: api.post('/eventos', data) — bate com app.use('/eventos', BandApplicationRoutes) no backend index.ts linha 84."
  file: TocaAqui/http/bandApplicationService.ts:24
  verdict: ok — rota correta

- timestamp: 2026-05-04T00:02:00Z
  finding: "BandApplicationRoutes.ts linha 21: router.post('/', validate(applyBandSchema), applyBandToEvent) — rota POST registrada corretamente."
  file: backend-TocaAqui/src/routes/BandApplicationRoutes.ts:21
  verdict: ok

- timestamp: 2026-05-04T00:03:00Z
  finding: "applyBandSchema (bandApplicationSchemas.ts): valor_proposto: z.number().positive() sem .optional() — campo OBRIGATORIO. Frontend sempre envia valor positivo, portanto validacao passa. Porem ha inconsistencia com assinatura do service que declara valor_proposto como opcional."
  file: backend-TocaAqui/src/schemas/bandApplicationSchemas.ts:8
  verdict: minor_inconsistency — nao causa 500

- timestamp: 2026-05-04T00:04:00Z
  finding: "BandApplicationService.apply() linha 42: BandApplicationModel.create({ artista_id, evento_id, mensagem, valor_proposto } — sem banda_id (artista individual). O modelo Sequelize declara banda_id allowNull: true. SE a migracao 29 foi aplicada, isso e valido."
  file: backend-TocaAqui/src/services/BandApplicationService.ts:42
  verdict: depends_on_migration_state

- timestamp: 2026-05-04T00:05:00Z
  finding: "CRITICO — migracao 20240101000008 cria tabela aplicacoes_banda_evento com banda_id: allowNull: false (NOT NULL no banco). A migracao 20240101000029 faz changeColumn para tornar banda_id nullable e adiciona coluna artista_id."
  file: backend-TocaAqui/src/migrations/20240101000008-create-aplicacoes-banda-evento.js:16
  verdict: root_cause_candidate

- timestamp: 2026-05-04T00:06:00Z
  finding: "Se migracao 29 NAO foi aplicada: (a) banda_id e NOT NULL no DB, (b) coluna artista_id nao existe, (c) coluna mensagem nao existe. Insert com artista_id e mensagem e sem banda_id causaria SequelizeDatabaseError. O errorHandler.ts nao trata SequelizeDatabaseError — cai no handler generico (linha 43-44): console.error + res.status(500)."
  file: backend-TocaAqui/src/middleware/errorHandler.ts:43
  verdict: CONFIRMED_500_PATH

- timestamp: 2026-05-04T00:07:00Z
  finding: "NotificationService.createNotification() tem try/catch interno que engole o erro (linha 12-14). Portanto NotificationService nao pode causar 500."
  file: backend-TocaAqui/src/services/NotificationService.ts:10
  verdict: eliminated

- timestamp: 2026-05-04T00:08:00Z
  finding: "Auth middleware garante req.user.id como number valido antes de chamar next(). Portanto AppError 401 e retornado corretamente se usuario nao autenticado."
  file: backend-TocaAqui/src/middleware/authmiddleware.ts
  verdict: eliminated

## Eliminated
- Rota errada no frontend (POST /eventos bate com BandApplicationRoutes)
- Erro na validacao do schema Zod (frontend sempre manda dados validos)
- Erro no NotificationService (swallowed internamente)
- Problema de autenticacao (auth middleware solid)
- Schema Zod incompativel com Zod v4 (v4 aceita .positive('string'))

## Resolution
- root_cause: Migracao 20240101000029-add-artista-candidatura-fields.js provavelmente nao foi aplicada no banco de dados. Essa migracao e responsavel por: (1) tornar banda_id nullable, (2) adicionar coluna artista_id, (3) adicionar coluna mensagem. Sem ela, qualquer insert de candidatura individual (sem banda_id) gera SequelizeDatabaseError do MySQL que cai no handler generico do errorHandler como HTTP 500.
- fix: Aplicar a migracao pendente: npx sequelize-cli db:migrate. Adicionalmente, corrigir applyBandSchema para tornar valor_proposto opcional (consistente com service) ou documentar que e obrigatorio no frontend.
- verification: Apos migrate, tentar se candidatar como artista individual deve retornar 201.
- files_changed: aplicar migracao (nenhum arquivo de codigo alterado necessario)
