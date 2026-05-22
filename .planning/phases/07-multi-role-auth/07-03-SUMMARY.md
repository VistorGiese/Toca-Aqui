---
phase: 7
plan: "07-03"
title: "Auth Middlewares — validação de roles[]"
subsystem: backend/middleware
tags: [auth, rbac, roles, middleware, jwt]
dependency_graph:
  requires: ["07-01"]
  provides: ["roles-aware-auth-middleware", "roles-aware-authorization"]
  affects: ["todas as rotas protegidas do backend"]
tech_stack:
  added: []
  patterns: ["array-based RBAC", "fallback role compatibility"]
key_files:
  created: []
  modified:
    - backend-TocaAqui/src/middleware/authmiddleware.ts
    - backend-TocaAqui/src/middleware/authorizationMiddleware.ts
    - backend-TocaAqui/src/controllers/UserController.ts
decisions:
  - "Mantido req.user.role para compatibilidade com código que ainda usa role singular"
  - "Fallback roles: decoded.roles > [decoded.role] > ['common_user'] garante tokens antigos funcionem"
  - "checkHasArtistProfile e checkHasEstablishmentProfile usam padrão (user.roles || [user.role]).includes() em vez de variável intermediária"
metrics:
  duration: "~8 min"
  completed: "2026-05-21"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 7 Plan 07-03: Auth Middlewares — validação de roles[] Summary

**One-liner:** Middlewares de autenticação e autorização atualizados para verificar `roles: string[]` em vez de `role` singular, com fallback total para tokens antigos.

## Tasks Completed

| Task      | Title                                                    | Commit  | Status    |
|-----------|----------------------------------------------------------|---------|-----------|
| 07-03-T1  | Atualizar AuthRequest e authMiddleware para roles[]      | 1e81e76 | Concluída |
| 07-03-T2  | Atualizar authorizationMiddleware — todas as funções     | d6a659e | Concluída |
| 07-03-T3  | Atualizar getUserProfile para retornar roles[]           | c36a5de | Concluída |

## What Was Built

### T1 — authmiddleware.ts

- `AuthRequest.user` agora declara `roles?: string[]` (mantém `role?: UserRole` para compat)
- `authMiddleware` monta o array `roles` com fallback em cadeia:
  1. `decoded.roles` (tokens novos com array)
  2. `[decoded.role]` (tokens antigos com role singular)
  3. `['common_user']` (fallback de segurança)
- `req.user.role` continua sendo setado via `roles[0]` para não quebrar código legado

### T2 — authorizationMiddleware.ts

Todas as 8 funções de autorização foram atualizadas:

- **`checkRole()`**: usa `req.user.roles || [req.user.role]` + `allowedRoles.some(r => userRoles.includes(r))`
- **`checkOwnership()`**: `userRoles.includes(UserRole.ADMIN)` em vez de `user.role === ADMIN`
- **`checkOwnershipOrAdmin()`**: `userRoles.includes(UserRole.ADMIN)`
- **`checkEstablishmentAccess()`**: `userRoles.includes(UserRole.ADMIN)`
- **`checkEstablishmentOwnerOnly()`**: `userRoles.includes(UserRole.ADMIN)`
- **`checkRolesOrAdmin()`**: `userRoles.includes(ADMIN)` + `allowedRoles.some(r => userRoles.includes(r))`
- **`checkHasArtistProfile()`**: `(user.roles || [user.role]).includes(ADMIN)`
- **`checkHasEstablishmentProfile()`**: `(user.roles || [user.role]).includes(ADMIN)`

### T3 — UserController.ts

- `getUserProfile` computa `userRoles` com fallback idêntico ao do middleware
- Objeto `user` retornado pela API `/usuarios/perfil` agora inclui `roles: string[]`
- Campo `roles` posicionado antes de `establishment_profiles` conforme especificação

## Deviations from Plan

None - plano executado exatamente como escrito.

## Verification

```
TypeScript: npx tsc --noEmit — sem erros
grep roles authmiddleware.ts — 5 ocorrências (interface + lógica de montagem)
grep userRoles authorizationMiddleware.ts — 14 ocorrências (todas as funções)
grep roles UserController.ts — 3 ocorrências (cálculo + campo no response)
```

## Known Stubs

Nenhum.

## Threat Flags

Nenhum novo surface introduzido — as mudanças são puramente internas à lógica de verificação de permissões.

## Self-Check: PASSED

- [x] authmiddleware.ts modificado e commitado (1e81e76)
- [x] authorizationMiddleware.ts modificado e commitado (d6a659e)
- [x] UserController.ts modificado e commitado (c36a5de)
- [x] `npx tsc --noEmit` sem erros
- [x] Todos os critérios de aceitação do plano verificados
