---
slug: logout-nao-limpa-token
status: resolved
trigger: Botao sair da conta vai para tela Login mas ao reabrir o app o usuario volta logado — token nao e limpo do AsyncStorage
created: 2026-05-04
updated: 2026-05-04
---

# Debug Session: logout-nao-limpa-token

## Symptoms
- expected: Ao clicar "Sair da conta", o token deve ser removido do AsyncStorage e o usuario deve permanecer na tela de Login ao reabrir o app
- actual: O app navega para Login mas ao reabrir o app o usuario volta logado (token persiste)
- error_messages: Nenhum erro visivel — comportamento silencioso
- timeline: Identificado no UAT de 2026-04-03
- reproduction: Clicar "Sair da conta" em UserSettings, fechar e reabrir o app

## Current Focus
- hypothesis: RESOLVED
- test: Fix aplicado em userService.ts
- expecting: Token sempre removido antes da chamada de rede
- next_action: none

## Evidence
- timestamp: 2026-05-04T00:00:00Z
  file: TocaAqui/http/userService.ts
  lines: 77-85
  note: |
    logout() chamava api.post("/usuarios/logout") e so depois chamava multiRemove(["token", "estabelecimentoId"]).
    Se o app fosse fechado enquanto a chamada de rede estava pendente (rede lenta, timeout, backend indisponivel),
    o processo era morto antes de multiRemove executar. Token permanecia em AsyncStorage.

- timestamp: 2026-05-04T00:00:01Z
  file: TocaAqui/contexts/AuthContext.tsx
  lines: 157-164
  note: |
    signOut() nao tem try/catch ao redor de userService.logout().
    clearAuth() so e chamado apos a promessa resolver — estado React e efemero;
    AsyncStorage e persistente. Token persistia se o processo morresse mid-await.

- timestamp: 2026-05-04T00:00:02Z
  file: TocaAqui/http/api.ts
  lines: 24-37
  note: |
    Interceptor de request le o token diretamente do AsyncStorage em cada chamada.
    Confirma que a limpeza do AsyncStorage e a operacao critica — se o token persiste
    no storage, o interceptor o re-injetaria em requests subsequentes.

## Eliminated
- signIn do AuthContext nao e usado pelo Login.tsx (usa signInWithToken) — nao e causa
- userRole persistindo nao causa re-login (loadStoredData so checa "token")
- clearAuth() funciona corretamente — limpa estado React
- Navigate.tsx: logica de condicional isAuthenticated esta correta

## Resolution
- root_cause: |
    Race condition em signOut: o token era removido do AsyncStorage DEPOIS da chamada de rede
    ao backend (api.post "/usuarios/logout"). Se o usuario fechasse o app enquanto essa chamada
    estava pendente (rede lenta, timeout, backend indisponivel), o processo era morto antes de
    multiRemove executar. Na proxima abertura, loadStoredData encontrava o token e reautenticava.
- fix: |
    Em userService.logout() (TocaAqui/http/userService.ts): movida a limpeza do AsyncStorage
    (multiRemove) e do header Authorization para ANTES da chamada api.post("/usuarios/logout").
    A chamada de rede passa a ser best-effort — o token ja esta removido localmente antes dela.
    Isso garante que mesmo se o app for fechado mid-logout, o token nao persiste.
- verification: |
    1. Login -> Sair -> fechar app imediatamente -> reabrir: deve permanecer em Login
    2. Login -> Sair com rede desligada -> reabrir: deve permanecer em Login
    3. Login normal -> Sair normal -> reabrir: deve permanecer em Login
- files_changed:
    - TocaAqui/http/userService.ts
