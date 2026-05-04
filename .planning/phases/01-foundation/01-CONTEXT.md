# Phase 1 Context: Foundation

**Generated:** 2026-03-30 (auto mode)
**Phase:** 1 — Foundation
**Goal:** App conecta ao backend correto em qualquer máquina, rotas de candidatura retornam dados, e a navegação do fluxo principal não crasha

---

## Prior Decisions Applied

- Artista e banda são o mesmo conceito — `perfis_artistas` é a entidade base
- Valor negociado via `valor_proposto` na candidatura (Phase 2 irá construir sobre isso)
- Recusa automática ao aceitar já implementada no `BandApplicationService.ts` do backend

---

## Codebase Scout Results

**Arquivo central de HTTP:** `TocaAqui/http/api.ts`
- Já usa `EXPO_PUBLIC_API_URL ?? http://${REACT_NATIVE_PACKAGER_HOSTNAME}:3000`
- Todos os service files importam `api` deste módulo — sem IPs hardcoded restantes

**Backend route mounting** (`backend-TocaAqui/src/index.ts`):
- `app.use("/eventos", BandApplicationRoutes)` → rotas: POST `/eventos`, GET `/eventos/minhas`, GET `/eventos/:evento_id`, PUT `/eventos/:id/aceitar`, PUT `/eventos/:id/recusar`

**Frontend bandApplicationService.ts** (arquivo modificado no git):
- `applyToEvent`: POST `/eventos` ✓ alinhado
- `getApplicationsByEvent`: GET `/eventos/${evento_id}` ✓ alinhado
- `getMyApplications`: GET `/eventos/minhas` ✓ alinhado
- Falta: `acceptApplication` e `rejectApplication` (PUT routes) — necessário para Phase 3
- Interface `BandApplication` falta campo `valor_proposto` — necessário para Phase 2

**Navegação:**
- `ArtistNavigator.tsx` registra corretamente: EventDetailArtist, ApplyConfirmation, ContractDetail, ShowDetail, RateEstablishment
- `ContractDetail.tsx` usa `RootStackParamList` como tipo (errado) em vez de `ArtistStackParamList` — funciona em runtime, mas errado semanticamente
- `MyApplications.tsx` usa `RootStackParamList` como tipo de navegação — só chama `goBack()`, sem crash real

**Problema real em `getApplicationsByEvent`:**
- Backend retorna `{ closed: true, message: "...", candidaturas: [...] }` quando evento já tem candidatura aceita
- Frontend faz `return response.data` diretamente — o chamador recebe um objeto, não um array
- Isso afeta o Phase 3 (EstGigApplications precisa listar candidaturas mesmo de evento fechado)

---

## Decisions (auto-selected)

### [auto] Decisão 1 — Base URL: verificar apenas, não reescrever
`api.ts` já está correto. O plano 01-01 deve:
- Confirmar que nenhum service cria instância axios própria com URL hardcoded
- Verificar que `userService.ts` usa `api.defaults.baseURL` e não URL hardcoded diretamente
- Documentar no README como rodar (`EXPO_PUBLIC_API_URL=http://IP:3000 npx expo start` ou deixar o Expo detectar automaticamente)

**Não fazer:** Recriar o sistema de baseURL — já está funcional.

### [auto] Decisão 2 — Rotas: adicionar campos faltantes ao serviço/interface
O plano 02-02 irá adicionar `valor_proposto` ao corpo do POST, mas como pré-requisito de Foundation:
- Adicionar `valor_proposto?: number` à interface `BandApplication` no frontend
- Fixar `getApplicationsByEvent` para lidar com resposta `{ closed: true, candidaturas: [...] }` — retornar o array `candidaturas` nesses casos
- Adicionar stubs `acceptApplication` e `rejectApplication` ao service (body pode ser passado para Phase 3 implementar, mas a assinatura deve existir para evitar erros de import)

**Por que na Phase 1:** `getApplicationsByEvent` quebra silenciosamente em eventos fechados — isso bloqueia Phase 3 (EstGigApplications).

### [auto] Decisão 3 — Navegação: corrigir tipos errados
- `ContractDetail.tsx`: trocar `RootStackParamList` → `ArtistStackParamList`
- `MyApplications.tsx`: trocar `RootStackParamList` → `ArtistStackParamList`
- Não remover as entradas legacy em `RootStackParamList` — podem existir referências em telas legacy

**Por que:** Tipo errado causa avisos de TypeScript e pode esconder bugs reais quando se adiciona navegação nesses componentes em fases futuras.

### [auto] Decisão 4 — Enum de status: frontend usa "rejeitado", backend salva "rejeitado"
O frontend filtra por `status === "rejeitado"`, e o backend usa `status: 'rejeitado'` no modelo. Verificar que o enum do backend model (`BandApplicationModel`) usa `rejeitado` (não `recusado`).

---

## Canonical Refs

- `TocaAqui/http/api.ts` — instância axios centralizada
- `TocaAqui/http/bandApplicationService.ts` — service a corrigir
- `TocaAqui/navigation/ArtistNavigator.tsx` — navegação do artista (stack correto)
- `TocaAqui/navigation/Navigate.tsx` — root navigator com entradas legacy
- `TocaAqui/screens/artist/ContractDetail.tsx` — tipo a corrigir
- `TocaAqui/screens/artist/MyApplications.tsx` — tipo a corrigir
- `backend-TocaAqui/src/index.ts` — route mounting (`/eventos`)
- `backend-TocaAqui/src/routes/BandApplicationRoutes.ts` — rotas de candidatura
- `backend-TocaAqui/src/services/BandApplicationService.ts` — lógica de apply/accept
- `backend-TocaAqui/src/schemas/bandApplicationSchemas.ts` — validação Zod (adicionar `valor_proposto` aqui em Phase 2)

---

## Deferred Ideas

- Adicionar `valor_proposto` ao schema Zod e ao controller do backend → Phase 2 (plan 02-02)
- Implementar `acceptApplication`/`rejectApplication` com lógica completa → Phase 3 (plan 03-01)
- Loading states globais durante fetch → Phase 5 (plan 05-03)

---

## Out of Scope (Phase 1)

- Stripe/pagamentos
- Sistema de ingresso
- Notificações push
- Chat artista ↔ estabelecimento

---

*Auto-generated by discuss-phase --auto on 2026-03-30*
