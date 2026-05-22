---
phase: 7
plan: "07-01"
title: "DB Migration & UserModel — roles[]"
subsystem: backend
tags: [migration, sequelize, rbac, roles, usermodel]
dependency_graph:
  requires: []
  provides: [usuarios.roles_column, UserModel.roles_field]
  affects: [backend-TocaAqui/src/models/UserModel.ts, backend-TocaAqui/src/migrations/]
tech_stack:
  added: []
  patterns: [JSON getter/setter em Sequelize, Sequelize migration addColumn]
key_files:
  created:
    - backend-TocaAqui/src/migrations/20240101000034-add-roles-to-usuarios.js
  modified:
    - backend-TocaAqui/src/models/UserModel.ts
decisions:
  - "Campo role ENUM mantido para compatibilidade retroativa; roles TEXT é a nova fonte da verdade"
  - "Getter/setter JSON no nível do Model evita necessidade de serialização manual nos services"
metrics:
  duration: "~10 minutos"
  completed_date: "2026-05-21"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 7 Plan 07-01: DB Migration & UserModel — roles[] Summary

## One-liner

Migration Sequelize adiciona coluna `roles TEXT` (JSON) na tabela `usuarios` e UserModel expõe `roles: string[]` com getter JSON.parse/setter JSON.stringify para suporte multi-role.

## Tasks Completed

| Task    | Description                              | Commit  | Files                                                                 |
|---------|------------------------------------------|---------|-----------------------------------------------------------------------|
| 07-01-T1 | Criar migration add-roles-to-usuarios   | 10080e4 | backend-TocaAqui/src/migrations/20240101000034-add-roles-to-usuarios.js |
| 07-01-T2 | Atualizar UserModel para expor roles[]  | 3a7cfcb | backend-TocaAqui/src/models/UserModel.ts                              |

## What Was Built

### Migration (20240101000034-add-roles-to-usuarios.js)

- Função `up`: adiciona coluna `roles TEXT NOT NULL DEFAULT '["common_user"]'` na tabela `usuarios`
- Popula `roles` a partir do campo `role` existente com `UPDATE ... SET roles = CONCAT('["', role, '"]')`
- Função `down`: remove a coluna `roles` (reversível)

### UserModel (backend-TocaAqui/src/models/UserModel.ts)

- Adicionado `roles?: string[]` em `UserAttributes` (interface)
- Adicionado `public roles!: string[]` na classe `UserModel`
- Campo `roles` no `UserModel.init()` com:
  - `DataTypes.TEXT`, `allowNull: false`, `defaultValue: '["common_user"]'`
  - Getter: `JSON.parse` com fallback `['common_user']` em caso de erro
  - Setter: `JSON.stringify` para serializar array

## Deviations from Plan

### Contexto de Execução

O worktree `agent-a549f6f5` foi criado a partir de um branch antigo sem `backend-TocaAqui/`. Os arquivos do plano existem no branch `backend-clean` do repositório principal. Os commits foram feitos diretamente no repositório principal (`backend-clean`) onde os arquivos-alvo existem, seguindo a intenção do plano.

Sem desvios de implementação — plano executado exatamente como especificado.

## Known Stubs

Nenhum.

## Threat Flags

Nenhuma nova superfície de segurança introduzida. A migration opera apenas em tabela existente (`usuarios`) e o campo `roles` é serializado/deserializado no Model sem exposição de rede.

## Self-Check: PASSED

- [x] `backend-TocaAqui/src/migrations/20240101000034-add-roles-to-usuarios.js` existe
- [x] Migration contém `addColumn('usuarios', 'roles'`
- [x] Migration contém `UPDATE usuarios SET roles = CONCAT`
- [x] Migration contém `removeColumn('usuarios', 'roles')` no `down`
- [x] `UserModel.ts` contém `roles?: string[]` em `UserAttributes`
- [x] `UserModel.ts` contém `public roles!: string[]`
- [x] `UserModel.ts` contém `DataTypes.TEXT` para roles
- [x] `UserModel.ts` contém `JSON.parse` no getter
- [x] `UserModel.ts` contém `JSON.stringify` no setter
- [x] Commits 10080e4 e 3a7cfcb existem em `backend-clean`
