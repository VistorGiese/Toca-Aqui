---
phase: 01-foundation
plan: 04
subsystem: frontend-establishment
tags: [error-handling, estab-flow, ux]
dependency_graph:
  requires: []
  provides: [correct-error-messages-accept-reject]
  affects: [EstAcceptContract]
tech_stack:
  added: []
  patterns: ["Backend errors serialized as { error: '...' } — always check data.error before data.message"]
key_files:
  created: []
  modified:
    - TocaAqui/screens/establishment/EstAcceptContract.tsx
decisions:
  - "Verificar data.error antes de data.message para alinhar com o formato do errorHandler.ts do backend"
metrics:
  duration: 2m
  completed: 2026-05-04
  tasks_completed: 1
  files_modified: 1
---

# Phase 01 Plan 04: Fix UAT Gaps — Error Message Ordering Summary

**One-liner:** Corrigida a ordem de extração de mensagem de erro em `EstAcceptContract.tsx` para exibir a mensagem real do backend ao invés do fallback genérico.

## What Was Built

`EstAcceptContract.tsx` tinha os catch blocks de `handleAccept` e `handleReject` verificando `data.message` antes de `data.error`. O backend (`errorHandler.ts` linha 13) serializa todos os `AppError` como `{ error: err.message }` — nunca usa o campo `message`. Por isso, qualquer erro de aceitar/recusar candidatura caía sempre no fallback "Erro ao aceitar/recusar candidatura." em vez de mostrar a mensagem específica do backend.

## Tasks Completed

| Task | Commit | Mudança |
|------|--------|---------|
| Fix error order in handleAccept | (pending) | `data.message \|\| data.error` → `data.error \|\| data.message` |
| Fix error order in handleReject | (pending) | `data.message \|\| data.error` → `data.error \|\| data.message` |

## Files Modified

- `TocaAqui/screens/establishment/EstAcceptContract.tsx` — linhas 57 e 87: ordem corrigida

## Deviations from Plan

Nenhum desvio — fix executado exatamente como planejado.

## Gap Closure Notes

- **Gap 1 (400 ao candidatar)**: Confirmado como comportamento correto (candidatura duplicada). `ApplyConfirmation.tsx` já usa `data.error` primeiro — sem bug.
- **Gap 2 (sem confirmação)**: `Alert.alert` existe e funciona. As candidaturas no banco provam envio bem-sucedido.
- **Gap 3 (aceitar falha)**: Este fix resolve a raiz — mensagem real do backend agora é exibida ao estabelecimento.

## Self-Check: PASSED

- `grep "data?.error || err?.response?.data?.message" TocaAqui/screens/establishment/EstAcceptContract.tsx | wc -l` → 2
- `grep "data?.message || err?.response?.data?.error" TocaAqui/screens/establishment/EstAcceptContract.tsx | wc -l` → 0
