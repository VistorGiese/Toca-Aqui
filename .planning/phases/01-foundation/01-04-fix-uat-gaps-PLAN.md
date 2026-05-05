---
wave: 1
depends_on: []
phase: 01
mode: gap_closure
files_modified:
  - TocaAqui/screens/establishment/EstAcceptContract.tsx
requirements: []
autonomous: true
---

# Plan 01-04: Fix UAT Gaps — Error Message Ordering

**Objective:** Corrigir a ordem de verificação de mensagens de erro em `EstAcceptContract.tsx` para que o backend error (`{ error: '...' }`) seja exibido ao usuário em vez do fallback genérico. Gap identificado no UAT da Phase 1.

## Context

O backend (`errorHandler.ts`) serializa todos os erros de aplicação como `{ error: err.message }`. O `EstAcceptContract.tsx` verifica `data.message` antes de `data.error`, o que faz com que a mensagem real nunca apareça e o usuário veja apenas "Erro ao aceitar candidatura." ou "Erro ao recusar candidatura." em todos os casos de falha.

## Must Haves

```yaml
truths:
  - "EstAcceptContract.tsx: linha de extração de msg no catch de handleAccept verifica data.error antes de data.message"
  - "EstAcceptContract.tsx: linha de extração de msg no catch de handleReject verifica data.error antes de data.message"
  - "O comportamento de aceitar/recusar não é alterado — apenas a ordem das propriedades no fallback chain"
```

## Tasks

<task id="01-04-T1">
  <name>Fix error message extraction order in EstAcceptContract.tsx</name>

  <read_first>
    - TocaAqui/screens/establishment/EstAcceptContract.tsx
    - backend-TocaAqui/src/middleware/errorHandler.ts (confirms error format is { error: '...' })
  </read_first>

  <action>
Em `TocaAqui/screens/establishment/EstAcceptContract.tsx`:

**Catch block do handleAccept (linha ~57):**
Alterar:
```ts
const msg = err?.response?.data?.message || err?.response?.data?.error || "Erro ao aceitar candidatura.";
```
Para:
```ts
const msg = err?.response?.data?.error || err?.response?.data?.message || "Erro ao aceitar candidatura.";
```

**Catch block do handleReject (linha ~87):**
Alterar:
```ts
const msg = err?.response?.data?.message || err?.response?.data?.error || "Erro ao recusar candidatura.";
```
Para:
```ts
const msg = err?.response?.data?.error || err?.response?.data?.message || "Erro ao recusar candidatura.";
```

Nenhuma outra alteração deve ser feita no arquivo.
  </action>

  <acceptance_criteria>
    - grep "data?.error || err?.response?.data?.message" TocaAqui/screens/establishment/EstAcceptContract.tsx | wc -l → 2 (dois matches, um no handleAccept e um no handleReject)
    - grep "data?.message || err?.response?.data?.error" TocaAqui/screens/establishment/EstAcceptContract.tsx | wc -l → 0 (nenhum match com a ordem antiga)
    - O arquivo ainda exporta o componente EstAcceptContract sem nenhuma mudança estrutural
  </acceptance_criteria>
</task>

## Verification

```bash
grep -n "data?.error || err?.response?.data?.message" TocaAqui/screens/establishment/EstAcceptContract.tsx
# Expected: 2 matches (handleAccept e handleReject catch blocks)

grep -n "data?.message || err?.response?.data?.error" TocaAqui/screens/establishment/EstAcceptContract.tsx
# Expected: no output (old order eliminated)
```

## Threat Model

Nenhuma ameaça de segurança — mudança apenas na ordem de propriedades lidas de um objeto de erro já capturado. Sem impacto em autenticação, autorização, ou dados.

## Notes

- Gap 1 (400 ao candidatar): Confirmado como comportamento correto do backend (candidatura duplicada é rejeitada). `ApplyConfirmation.tsx` já verifica `data.error` primeiro — sem bug.
- Gap 2 (sem confirmação): `Alert.alert("Candidatura enviada!")` existe e funciona. As 2 candidaturas presentes no banco confirmam envio bem-sucedido. UX pode ser melhorada em fase futura.
- Gap 3 (aceitar falha): Este plano corrige o único bug real — ordem de extração de mensagem de erro.
- Fluxo completo de aceitar/recusar (incluindo criação de contrato, recusa automática das demais) é escopo da Phase 3.
