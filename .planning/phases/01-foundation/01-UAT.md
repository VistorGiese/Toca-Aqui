---
status: diagnosed
phase: 01-foundation
source: 01-01-fix-base-url-SUMMARY.md, 01-02-fix-band-application-routes-SUMMARY.md, 01-03-fix-navigation-params-SUMMARY.md
started: 2026-05-04T00:00:00Z
updated: 2026-05-04T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. App conecta ao backend
expected: O app inicia e consegue se comunicar com o backend sem erros de URL hardcoded. Abra o app, tente fazer login ou cadastro — a requisição HTTP deve chegar ao servidor normalmente (sem falha de "network request failed" por IP errado).
result: pass

### 2. Lista de candidaturas do evento carrega
expected: Como estabelecimento, ao abrir a tela de candidaturas de um evento, a lista de candidaturas é exibida sem erro. Antes da correção, retornava 404 pois a rota estava errada. Agora deve carregar os dados do evento corretamente.
result: issue
reported: "não esta sendo possivel se candidatar ao evento como artista, erro 400 bad request"
severity: major

### 3. Tela "Minhas Candidaturas" carrega para artista
expected: Como artista, ao acessar a tela "Minhas Candidaturas", a lista de candidaturas enviadas aparece sem erros de rede ou tela em branco.
result: issue
reported: "apareceram as duas candidaturas na tela de minhas candidaturas, td certo, porém não tive um aviso da confirmação da aplicação quando estava na tela de aplicar na vaga"
severity: minor

### 4. Navegacao para ContractDetail funciona
expected: Na tela MyApplications, ao tocar em uma candidatura/contrato, a navegacao para a tela ContractDetail ocorre sem crash ou erro de TypeScript em runtime. A tela de detalhe abre normalmente.
result: issue
reported: "aparentemente para verificar o contrato o estabelecimento deve ter aceitado a candidatura, mas ao tentar aceitar ocorreu erro, não foi exposto qual mas não funcionou"
severity: major

## Summary

total: 4
passed: 1
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Artista consegue se candidatar a um evento sem erros"
  status: failed
  reason: "User reported: não esta sendo possivel se candidatar ao evento como artista, erro 400 bad request"
  severity: major
  test: 2
  root_cause: "Backend retorna 400 com 'Você já possui candidatura ativa para este evento' ao tentar aplicar em evento já candidatado. A mensagem de erro não é exibida claramente para o usuário (frontend mostra 'Não foi possível enviar a candidatura.' genérico em vez da mensagem real do backend)."
  artifacts:
    - path: "TocaAqui/http/bandApplicationService.ts"
      issue: "applyToEvent retorna response.data que é { message, aplicacao } mas o frontend não verifica duplicidade antes de submeter"
    - path: "TocaAqui/screens/artist/ApplyConfirmation.tsx"
      issue: "Catch block usa err?.response?.data?.error mas backend pode retornar { message: '...' } — precisa verificar ambos os campos"
  missing:
    - "Tratar duplicidade de candidatura com mensagem clara antes de submeter"
  debug_session: ""

- truth: "Ao se candidatar a uma vaga, o artista recebe um aviso/confirmação visual de que a candidatura foi enviada"
  status: failed
  reason: "User reported: não tive um aviso da confirmação da aplicação quando estava na tela de aplicar na vaga"
  severity: minor
  test: 3
  root_cause: "Alert.alert('Candidatura enviada!') existe no código (ApplyConfirmation.tsx:84) e deve ser exibido. Candidaturas existem no banco (2 confirmadas). Provável que o Alert apareceu mas foi descartado junto com navigation.popToTop(), ou o usuário não o percebeu. UX de confirmação precisa ser mais explícita (ex: tela dedicada de sucesso em vez de Alert efêmero)."
  artifacts:
    - path: "TocaAqui/screens/artist/ApplyConfirmation.tsx"
      issue: "Confirmação via Alert.alert é efêmera e some com navigation.popToTop() — usuário pode não perceber"
  missing:
    - "Substituir Alert de confirmação por tela/estado de sucesso mais visível"
  debug_session: ""

- truth: "Estabelecimento consegue aceitar uma candidatura e artista consegue ver o contrato gerado em ContractDetail"
  status: failed
  reason: "User reported: aparentemente para verificar o contrato o estabelecimento deve ter aceitado a candidatura, mas ao tentar aceitar ocorreu erro, não foi exposto qual mas não funcionou"
  severity: major
  test: 4
  root_cause: "establishmentService.acceptApplication chama PUT /eventos/:id/aceitar onde :id deve ser o ID da candidatura (BandApplication.id). O middleware checkEventOwnership valida que o usuário logado é dono do estabelecimento que criou o evento. Falha silenciosa pode ocorrer se: (1) o estabelecimento não pertence ao usuário logado, (2) a candidatura/evento não foi encontrada no banco. Stubs de aceitar/recusar foram parcialmente implementados na fase 1 — fluxo completo era escopo da fase 3."
  artifacts:
    - path: "backend-TocaAqui/src/routes/BandApplicationRoutes.ts"
      issue: "checkEventOwnership middleware pode rejeitar silenciosamente — o erro não é exposto com mensagem clara no frontend"
    - path: "TocaAqui/screens/establishment/EstAcceptContract.tsx"
      issue: "catch block exibe mensagem genérica se err.response.data.message e err.response.data.error forem undefined"
  missing:
    - "Verificar que o usuário do estabelecimento está corretamente associado no middleware"
    - "Garantir que a mensagem de erro do backend seja exibida no Alert"
  debug_session: ""
