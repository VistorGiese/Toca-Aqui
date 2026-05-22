---
plan: "07-02"
phase: 7
title: "JWT & AuthService — roles[]"
status: complete
completed: 2026-05-21
tasks_completed: 3
tasks_total: 3
---

## Summary

Atualização do sistema de autenticação para suportar múltiplas roles por usuário. `TokenPayload` agora usa `roles: string[]` como campo obrigatório, `AuthService` inclui todas as roles no token JWT e ao retornar dados do usuário, e os métodos de criação de perfil adicionam roles ao array sem sobrescrever as existentes.

## What Was Built

### T1 — TokenPayload em jwt.ts
- `roles: string[]` agora é campo obrigatório em `TokenPayload`
- `role?: string` mantido como opcional com `@deprecated` para backward compat com tokens antigos em AsyncStorage

### T2 — AuthService.login() e register()
- `LoginResult.user` trocado de `role: string` para `roles: string[]`
- `register()`: cria usuário com `roles: [role]` (array inicial)
- `register()` retorno: inclui `roles: user.roles`
- `login()`: computa `userRoles` a partir de `user.roles` com fallback para `[user.role]` (tokens antigos)
- `login()` passa `roles: userRoles` para `generateToken` e retorna no objeto `user`

### T3 — createArtistProfile() e createEstablishmentProfile()
- `createArtistProfile()`: antes do `return ArtistProfileModel.create(...)`, busca o usuário e adiciona `'artist'` ao array de roles sem sobrescrever. Verificação `includes()` garante idempotência.
- `createEstablishmentProfile()`: após o geocoding, busca o usuário e adiciona `'establishment_owner'` ao array de roles sem sobrescrever. Verificação `includes()` garante idempotência.

## Key Files Modified

- `backend-TocaAqui/src/utils/jwt.ts` — TokenPayload com roles[]
- `backend-TocaAqui/src/services/AuthService.ts` — login, register, createArtistProfile, createEstablishmentProfile

## Deviations

Nenhum desvio do plano.

## Self-Check: PASSED

- [x] TokenPayload.roles: string[] (obrigatório), role?: string (deprecated, opcional)
- [x] LoginResult.user.roles: string[]
- [x] AuthService.login() monta userRoles a partir de user.roles e inclui no token
- [x] register() salva roles: [role] ao criar usuário
- [x] createArtistProfile() adiciona 'artist' ao array sem sobrescrever
- [x] createEstablishmentProfile() adiciona 'establishment_owner' ao array sem sobrescrever
