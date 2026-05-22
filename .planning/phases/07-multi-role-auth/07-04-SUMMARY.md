---
plan: "07-04"
phase: 7
title: "Frontend — tipos, AuthContext e navegação para roles[]"
status: complete
completed: 2026-05-21
tasks_completed: 4
tasks_total: 4
---

## Summary

Atualização completa do frontend para suportar `roles: UserRole[]` em vez de `role: UserRole` singular. Inclui o tipo `User`, as interfaces de resposta do `userService`, o `AuthContext` (todos os 5 pontos de `setUser`), e a lógica de roteamento em `Navigate.tsx`.

## What Was Built

### T1 — types/index.ts
- Interface `User`: `roles: UserRole[]` agora obrigatório, `role?: UserRole` deprecado e opcional
- `UserRole` type mantido sem alteração

### T2 — userService.ts
- `LoginResponse.user`: `roles: string[]` (obrigatório), `role?: string` (opcional, deprecated)
- `ProfileResponse.user`: `roles?: string[]` adicionado, `role` tornou-se opcional

### T3 — AuthContext.tsx
- `signInWithToken` interface: aceita `roles: string[]` + `role?: string`
- `loadStoredData`: computa `roles[]` com fallback (`u.roles || [u.role] || ['common_user']`)
- `signIn` (try block): computa `loginRoles`, `setUser({ ...roles: loginRoles })`
- `signIn` (catch block): usa `loginRoles` computado no try
- `signInWithToken`: computa `tokenRoles`, `setUser({ ...roles: tokenRoles })`
- `updateUser`: computa `updatedRoles`, `setUser({ ...roles: updatedRoles })`
- Nenhum `setUser()` usa `role: x as UserRole` como campo obrigatório

### T4 — Navigate.tsx
- `getInitialRoute`: computa `userRoles = user.roles || [user.role] || []`
- `hasArtistProfile`: usa `userRoles.includes("artist")` — não `user.role === "artist"`
- `hasEstProfile`: usa `userRoles.includes("establishment_owner") || userRoles.includes("establishment")`

## Key Files Modified

- `TocaAqui/types/index.ts`
- `TocaAqui/http/userService.ts`
- `TocaAqui/contexts/AuthContext.tsx`
- `TocaAqui/navigation/Navigate.tsx`

## Deviations

Nenhum desvio do plano.

## Self-Check: PASSED

- [x] User.roles: UserRole[] em types/index.ts (obrigatório), role?: UserRole (opcional)
- [x] LoginResponse.user.roles: string[] em userService.ts
- [x] AuthContext usa roles em todos os 5 setUser() calls
- [x] Fallback para tokens antigos: u.role ? [u.role as UserRole] : ['common_user']
- [x] getInitialRoute usa userRoles.includes() — não user.role ===
