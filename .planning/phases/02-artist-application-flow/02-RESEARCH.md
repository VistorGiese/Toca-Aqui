# Phase 2: Artist Application Flow - Research

**Researched:** 2026-04-01
**Domain:** React Native (Expo) frontend + Node/Sequelize backend — artist candidatura flow
**Confidence:** HIGH (all findings sourced directly from codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**BrowseEvents — Display & Filtro**
- Passar `{ status: 'pendente' }` como query param na chamada ao backend (`/agendamentos?status=pendente`) — filtro no servidor, não client-side
- Backend deve incluir `nome_estabelecimento` na resposta via JOIN com `EstablishmentProfileModel` — exibir nome real no card
- `EventDetailArtist` mantém fetch separado (busca avaliações, dados do estabelecimento) — não passar booking via params

**ApplyConfirmation — valor_proposto**
- Campo `valor_proposto` é obrigatório — artista não pode submeter candidatura sem informar um valor
- Campo começa vazio — artista decide o próprio valor (sem pre-fill)
- Schema Zod no backend (`applyBandSchema`) deve ser atualizado para incluir `valor_proposto: z.number().positive()` (obrigatório)
- Controller `applyBandToEvent` deve ler e repassar `valor_proposto` ao service
- `BandApplicationService.apply()` deve salvar `valor_proposto` no model

**MyApplications — Refresh & UX**
- Adicionar `useFocusEffect` para re-fetch automático ao voltar à tela — atende success criteria "atualiza ao voltar para a tela"
- Estrutura do card preparada para botão "Ver contrato", mas implementação do botão fica para Phase 3
- Status string `"recusado"` já alinhado com backend (Phase 1 corrigiu "rejeitado" → "recusado")

### Claude's Discretion
- Formatação do input de valor (moeda vs número puro) — usar formato numérico simples com placeholder "Ex: 350"
- Onde exibir `valor_proposto` submetido em `MyApplications` — mostrar no card de candidatura se disponível

### Deferred Ideas (OUT OF SCOPE)
- Botão "Ver contrato" em candidaturas aceitas em `MyApplications` → Phase 3 (03-03: contract-detail-confirm)
- Loading skeleton em cards de BrowseEvents → Phase 5 (05-03: loading-states)
- Validação de range (cache_minimo ≤ valor_proposto ≤ cache_maximo) → out of scope para o TCC
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-04 | Artista pode navegar eventos disponíveis em `BrowseEvents` e ver apenas eventos com status aberto (`pendente`) | `BookingController.getBookings` já aceita `?status=pendente` server-side; frontend precisa passar o param; JOIN de estabelecimento deve ser adicionado ao controller |
| REQ-05 | Artista pode se candidatar a um evento informando um valor proposto (`valor_proposto`) | `valor_proposto` ausente em 4 camadas do backend (migration, model, schema Zod, service) e em 2 camadas do frontend (service type, UI); todas devem ser corrigidas em sequência |
| REQ-06 | Artista pode ver suas candidaturas em `MyApplications` com status atualizado (pendente / aceito / recusado) | `getApplicationsByArtist` já retorna `nome_evento`, `nome_estabelecimento`, `status`; faltam `useFocusEffect`, `valor_proposto` no retorno, e normalização `'rejeitado'→'recusado'` |
</phase_requirements>

---

## Summary

A fase é inteiramente de correção e extensão de código existente — não há telas novas a criar. Todos os três planos operam sobre arquivos já presentes: dois no frontend (`BrowseEvents`, `ApplyConfirmation`, `MyApplications`) e cinco no backend (`BandApplicationModel`, `BandApplicationService`, `BandApplicationController`, `applyBandSchema`, `BookingController`).

O bloqueador mais crítico é o campo `valor_proposto`: ele **não existe em nenhuma camada** — não está na migration original, não está no Sequelize model, não está no schema Zod, não está no controller, e não está no service. A cadeia completa de mudanças é: (1) nova migration para adicionar a coluna, (2) declaração no Sequelize model, (3) adição ao Zod schema, (4) leitura no controller, (5) passagem ao `service.apply()`, e (6) campo de input no frontend incluindo atualização da assinatura de `applyToEvent`.

O segundo bloqueador é `BrowseEvents`: o filtro `status=pendente` já é feito no frontend mas **nunca é enviado ao backend** — a chamada `bookingService.getBookings()` não aceita params. A correção é passar `{ status: 'pendente' }` via axios params e adicionar o JOIN de `EstablishmentProfileModel` no `BookingController.getBookings`.

`MyApplications` está quase pronto: o backend já faz JOIN e retorna `nome_evento`, `nome_estabelecimento`, `data_show`. A única falta real é `useFocusEffect` (re-fetch ao navegar de volta), exibir `valor_proposto` no card, e normalizar o status `'rejeitado'` → `'recusado'` no mapeamento do service.

**Primary recommendation:** Executar os três planos na ordem 02-01 → 02-02 → 02-03. O 02-02 (apply-to-gig) é o mais invasivo (migration + 4 camadas de backend + frontend).

---

## Standard Stack

### Core (já instalado no projeto — nenhum novo pacote necessário)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-navigation/native | v6 | `useFocusEffect` para re-fetch em MyApplications | Já instalado; padrão usado em `EstGigs.tsx` e `Profile.tsx` |
| zod | ~3.x | Validação de schema — adicionar `valor_proposto` | Já em uso em `applyBandSchema` e todos os outros schemas |
| sequelize | ~6.x | ORM — adicionar `valor_proposto` ao model | Já usado em todos os models do projeto |
| sequelize-cli | presente | Migrations — nova migration para coluna `valor_proposto` | Já em uso nas 31 migrations existentes |

### Nenhum `npm install` necessário para esta fase.

---

## Architecture Patterns

### Padrão de re-fetch ao focar tela (useFocusEffect)

O padrão `useFocusEffect` já existe em dois lugares no projeto:
- `TocaAqui/screens/establishment/EstGigs.tsx` (linha 3, 39)
- `TocaAqui/screens/Profile.tsx` (linha 3, 98)

`ArtistSchedule.tsx` e `MyApplications.tsx` usam apenas `useEffect` — correto para mount, mas não atualiza ao navegar de volta.

```typescript
// Padrão confirmado em EstGigs.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

useFocusEffect(useCallback(() => { load(); }, [load]));
```

### Padrão de loading state (todos os screens artist)

```typescript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={DS.accent} />
    </View>
  );
}
```

### Padrão de fetch com isRefresh

```typescript
// Padrão presente em BrowseEvents.tsx e MyApplications.tsx
const fetchXxx = useCallback(async (isRefresh = false) => {
  if (isRefresh) setRefreshing(true);
  try {
    const data = await xxxService.getXxx();
    setXxx(data);
  } catch {
    Alert.alert("Erro", "mensagem padrão");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
```

### Padrão de migration addColumn

```javascript
// Fonte: 20240101000029-add-artista-candidatura-fields.js (existente no projeto)
async up(queryInterface, Sequelize) {
  await queryInterface.addColumn('aplicacoes_banda_evento', 'valor_proposto', {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,  // nullable para não quebrar candidaturas existentes no banco
  });
}
```

### Sequência completa de mudanças para valor_proposto

```
1. Nova migration: 20240101000032-add-valor-proposto-to-aplicacoes.js
   → addColumn('aplicacoes_banda_evento', 'valor_proposto', DECIMAL(10,2) nullable)

2. BandApplicationModel.ts
   → Declarar: valor_proposto?: number  (propriedade da classe)
   → init(): adicionar campo com DataTypes.DECIMAL(10, 2), allowNull: true

3. bandApplicationSchemas.ts
   → applyBandSchema: valor_proposto: z.number().positive()  (obrigatório)

4. BandApplicationController.ts — applyBandToEvent
   → Desestruturar valor_proposto de req.body
   → Passar para bandApplicationService.apply(...)

5. BandApplicationService.ts — apply()
   → Adicionar valor_proposto?: number à assinatura
   → Incluir valor_proposto em BandApplicationModel.create() — em AMBOS os branches
     (artista individual E banda)
   → getApplicationsByArtist(): adicionar valor_proposto: a.valor_proposto ?? null ao mapeamento
   → Também normalizar status 'rejeitado' → 'recusado' no mapeamento

6. Frontend — bandApplicationService.ts
   → applyToEvent() param type: adicionar valor_proposto: number (obrigatório)
   → BandApplication interface: valor_proposto?: number já está na linha 16 — sem mudança

7. ApplyConfirmation.tsx
   → Adicionar estado: const [valorProposto, setValorProposto] = useState("")
   → Adicionar TextInput com keyboardType="numeric", placeholder="Ex: 350"
   → handleEnviar: converter para número, validar > 0, adicionar ao payload
   → Mensagem de apresentação deve permanecer obrigatória também
```

### Anti-Patterns a Evitar

- **Filtro client-side de status em vez de server-side:** `BrowseEvents` já faz isso; a mudança para `?status=pendente` é necessária
- **`useEffect` para re-fetch ao retornar de tela:** usar `useFocusEffect`
- **`(as any)` no BandApplicationModel.create() suprimindo `valor_proposto`:** incluir explicitamente no objeto passado ao `create()`
- **TextInput retorna string:** sempre converter com `parseFloat()` antes de enviar valor numérico ao backend

---

## Findings: Respostas às Perguntas-Chave

### Q1: `valor_proposto` — existe na DB/migrations?

**NÃO.** Verificado em todas as 31 migrations listadas. A migration original `20240101000008-create-aplicacoes-banda-evento.js` cria a tabela com `banda_id`, `evento_id`, `status`, `data_aplicacao` — sem `valor_proposto`. A migration `20240101000029-add-artista-candidatura-fields.js` adicionou `artista_id` e `mensagem`, mas **não** `valor_proposto`. O `BandApplicationModel.ts` também não declara o campo — nem na classe, nem em `init()`.

O único lugar onde `valor_proposto` aparece no projeto hoje é a interface TypeScript do frontend (`TocaAqui/http/bandApplicationService.ts`, linha 16) como `valor_proposto?: number` — mas isso é apenas um tipo, não reflete realidade no banco.

**Ação necessária:** Nova migration (arquivo 32).

### Q2: `BookingController.getBookings` — retorna `nome_estabelecimento`?

**NÃO.** `getBookings` faz `BookingModel.findAndCountAll({ where, order, limit, offset })` sem nenhum `include`. A resposta contém apenas colunas da tabela `agendamentos`. O campo `nome_estabelecimento` não está presente.

A associação necessária **já existe** em `associations.ts`:
```typescript
BookingModel.belongsTo(EstablishmentProfileModel, {
  foreignKey: 'perfil_estabelecimento_id',
  as: 'EstablishmentProfile',
});
```
O `EstablishmentProfileModel` já está importado no `BookingController.ts` (linha 5). O JOIN pode ser adicionado diretamente ao `findAndCountAll` sem nenhuma alteração em associations.

O `Booking` interface no frontend (`bookingService.ts`) precisa de `nome_estabelecimento?: string` (e idealmente `EstablishmentProfile?: { nome_estabelecimento: string }`).

**Atenção ao cache Redis:** `getBookings` armazena resultado no Redis. A chave inclui os query params via `sortedParams`, então `?status=pendente` gera uma chave diferente de `all` — não há risco de cache stale para a nova chamada filtrada.

### Q3: `BandApplicationService.apply()` — aceita e armazena `valor_proposto`?

**NÃO.** Assinatura atual:
```typescript
async apply(banda_id, evento_id, requestingUserId?, artista_id?, mensagem?)
```

`valor_proposto` não está na assinatura. Ambos os `BandApplicationModel.create(...)` — artista individual (linha 41) e banda (linha 74) — não incluem o campo. O cast `as any` significa que mesmo se passado no objeto, seria silenciosamente aceito, mas primeiro precisa existir na coluna do banco.

### Q4: `getMyApplications` endpoint — o que retorna exatamente?

**Retorna array direto (sem wrapper).** Controller: `res.json(aplicacoes)`. Frontend: `return response.data` — compatível.

Campos retornados hoje por `getApplicationsByArtist()`:
- `id`, `status`, `mensagem`, `data_aplicacao`, `evento_id`
- `nome_evento` (de `Event.titulo_evento`)
- `data_show`, `horario_inicio`, `horario_fim`
- `nome_estabelecimento` (de `Event.EstablishmentProfile.nome_estabelecimento`)

`valor_proposto` **NÃO** está no mapeamento — deve ser adicionado após a coluna existir no banco.

**Status mismatch identificado:** `ApplicationStatus.REJEITADO = 'rejeitado'` (backend enum) vs `a.status === "recusado"` (filtro no frontend `MyApplications`). O backend grava `'rejeitado'` quando uma candidatura é recusada — este valor não cai em nenhuma tab do `MyApplications` porque ele filtra por `"recusado"`. A solução mais segura para o TCC: normalizar no mapeamento de `getApplicationsByArtist` — trocar `'rejeitado'` por `'recusado'` antes de retornar ao frontend.

### Q5: `ApplyConfirmation.tsx` — estado atual

Parâmetros recebidos via `route.params`:
```typescript
const { eventId, eventName, date, time, cache } = route.params;
// Tipo em ArtistStackParamList:
ApplyConfirmation: { eventId: number; eventName: string; date: string; time: string; cache: string; }
```

Payload enviado ao backend:
```typescript
await bandApplicationService.applyToEvent({
  evento_id: eventId,
  mensagem: mensagem.trim(),  // único campo além do evento_id
});
```

`valor_proposto` não é enviado. A validação atual bloqueia apenas se `mensagem` estiver vazia. Após a mudança, `valor_proposto` deve ser adicionado como campo obrigatório no form e no payload.

A assinatura atual de `applyToEvent` no frontend:
```typescript
(data: { evento_id: number; artista_id?: number; mensagem: string }): Promise<BandApplication>
```
Precisa adicionar `valor_proposto: number` (obrigatório por decisão do CONTEXT.md).

**Nota adicional:** O caminho da rota em `applyToEvent` ainda é `/eventos` (linha 23 de `bandApplicationService.ts`) — incorreto. A rota correta é `/candidaturas` (conforme `BandApplicationRoutes.ts`). Este bug deve ser tratado no plano 02-02.

### Q6: `EventDetailArtist` passa `cache` para `ApplyConfirmation`?

**SIM.** `handleCandidatar()` navega para `ApplyConfirmation` com:
```typescript
navigation.navigate("ApplyConfirmation", {
  eventId: booking.id,
  eventName: booking.titulo_evento || `Vaga #${booking.id}`,
  date: formattedDate,
  time: timeStr,
  cache: booking.preco_ingresso_inteira
    ? `R$ ${Number(booking.preco_ingresso_inteira).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "A combinar",
});
```

`cache_minimo` e `cache_maximo` **não são passados** — estão fora do escopo conforme CONTEXT.md. Nenhuma mudança necessária em `EventDetailArtist` para esta fase.

### Q7: TypeScript type issues em `BrowseEvents`?

**SIM — dois problemas detectados.**

**Problema 1 (exibição):** `BookingCard` renderiza `booking.estabelecimento_id ? 'Estab. #${booking.estabelecimento_id}' : "Local não informado"`. O campo `estabelecimento_id` provavelmente é `undefined` em todos os registros reais do backend (o backend usa `perfil_estabelecimento_id`). O card sempre mostra "Local não informado". Após o JOIN, deve usar `booking.nome_estabelecimento ?? "Local não informado"`.

**Problema 2 (tipo):** A interface `Booking` em `bookingService.ts` declara `estabelecimento_id: number` mas o campo real no backend é `perfil_estabelecimento_id`. Não causa erro em runtime (apenas `undefined`), mas é um type lie. Ao adicionar `nome_estabelecimento?: string` à interface, pode-se manter `estabelecimento_id` como optional ou removê-lo — não há impacto nas telas de estabelecimento que consomem `Booking` (elas usam `perfil_estabelecimento_id`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Re-fetch ao focar tela | Custom navigation state listener | `useFocusEffect` de `@react-navigation/native` | API nativa para este caso; já em uso no projeto |
| Adicionar coluna ao banco | Sync forçado (`ALTER TABLE` direto) | Migration Sequelize (`addColumn`) | Reversível; consistente com os outros 31 arquivos de migration |
| Validação de campo no controller | Guards `if/else` manuais | Zod schema via `validate()` middleware | Já wired em todas as rotas; `applyBandSchema` já usa |
| Conversão de string para number | Regex ou parsing manual | `parseFloat()` + validação `isNaN` + `> 0` | Suficiente para o caso de uso; sem dependência nova |

---

## Common Pitfalls

### Pitfall 1: `valor_proposto` silenciosamente descartado pelo Sequelize
**What goes wrong:** Adicionado ao service e ao payload, mas esquecido na migration ou no `init()` do model. O Sequelize ignora campos não declarados em `init()` ao fazer `create()`.
**Why it happens:** O cast `as any` nos `BandApplicationModel.create(...)` suprime erro de tipo — o erro passa despercebido.
**How to avoid:** Executar a migration antes de qualquer teste. Verificar ambos os branches no `apply()` (artista individual na linha 41 E banda na linha 74).
**Warning signs:** `valor_proposto` retorna `null` no banco mesmo quando enviado pelo frontend.

### Pitfall 2: TextInput retorna string — backend Zod rejeita com 400
**What goes wrong:** `onChangeText` de `TextInput` retorna sempre string. Enviar `"350"` (string) para um campo `z.number().positive()` causa erro de validação Zod.
**Why it happens:** Zod `z.number()` não faz coerção automática de string para number (ao contrário de `z.coerce.number()`).
**How to avoid:** Converter com `parseFloat(valorProposto)` antes de incluir no payload. Validar antes do envio: `isNaN(valorNum) || valorNum <= 0`.
**Warning signs:** Resposta do backend com status 400 e body `{ error: "valor_proposto: Expected number, received string" }`.

### Pitfall 3: Status 'rejeitado' vs 'recusado' — aba "Recusadas" sempre vazia
**What goes wrong:** `MyApplications` filtra `status === "recusado"` na aba "Recusadas", mas o backend grava `'rejeitado'` (`ApplicationStatus.REJEITADO`). Candidaturas recusadas caem no vazio.
**Why it happens:** O enum do backend nunca foi atualizado para `'recusado'`; Phase 1 só alinhou o frontend.
**How to avoid:** Normalizar `'rejeitado'` → `'recusado'` no mapeamento de `getApplicationsByArtist()` antes de retornar ao frontend. Também atualizar `BandApplication.status` type union no frontend para incluir `"rejeitado"` como fallback opcional.
**Warning signs:** Aba "Recusadas" sempre vazia no simulador mesmo após candidatura ser rejeitada no banco.

### Pitfall 4: `useFocusEffect` com dependência instável → loop de fetch
**What goes wrong:** Se `fetchApplications` for recriado a cada render, o `useCallback` do `useFocusEffect` detecta mudança de referência e dispara novamente — loop infinito de requisições.
**Why it happens:** `useFocusEffect` re-executa quando a função passada como dependência muda de referência.
**How to avoid:** `fetchApplications` já é declarado com `useCallback(async () => {...}, [])` em `MyApplications.tsx` — manter essa declaração, não adicionar dependências desnecessárias.
**Warning signs:** Logs mostram múltiplas requisições `/eventos/minhas` ao focar a tela.

### Pitfall 5: Cache Redis servindo `getBookings` sem o JOIN
**What goes wrong:** Após adicionar o JOIN a `getBookings`, chamadas com `?status=pendente` podem retornar o cache da chave `agendamentos:status=pendente` gravado antes do JOIN ser adicionado.
**Why it happens:** `CACHE_TTL.MEDIUM` armazena o response. A chave `agendamentos:status=pendente` é gerada pelo hash de params — não existe antes da mudança, então a primeira chamada sempre vai ao banco. Sem problema para ambiente de desenvolvimento limpo.
**How to avoid:** Sem ação necessária para ambiente fresh. Se o Redis tiver dados anteriores, executar `FLUSHALL` uma vez durante desenvolvimento.
**Warning signs:** Cards aparecem sem `nome_estabelecimento` mesmo após o JOIN ser adicionado e testado.

### Pitfall 6: Rota errada em `applyToEvent` — `"/eventos"` em vez de `"/candidaturas"`
**What goes wrong:** `bandApplicationService.applyToEvent` chama `api.post("/eventos", data)` — esta rota não existe para POST de candidatura; retorna 404 ou cria um agendamento por engano.
**Why it happens:** O arquivo tinha a rota errada antes da Phase 1; pode não ter sido corrigido no branch atual.
**How to avoid:** Verificar o arquivo atual e corrigir para `/candidaturas` (conforme `BandApplicationRoutes.ts` que registra `router.post("/")`).
**Warning signs:** Submissão de candidatura retorna 404 ou cria objeto inesperado.

---

## Code Examples

### useFocusEffect em MyApplications.tsx

```typescript
// Substituir o useEffect atual por useFocusEffect
import { useFocusEffect } from "@react-navigation/native";

// Manter fetchApplications com useCallback (já assim no arquivo)
const fetchApplications = useCallback(async (isRefresh = false) => {
  if (isRefresh) setRefreshing(true);
  try {
    const data = await bandApplicationService.getMyApplications();
    setApplications(data);
  } catch {
    Alert.alert("Erro", "Não foi possível carregar as candidaturas.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

// Substituir useEffect por:
useFocusEffect(
  useCallback(() => {
    fetchApplications();
  }, [fetchApplications])
);
// Remover o useEffect que chamava fetchApplications (torna-se redundante)
```

### Zod schema atualizado

```typescript
// backend-TocaAqui/src/schemas/bandApplicationSchemas.ts
import { z } from 'zod';

export const applyBandSchema = z.object({
  banda_id: z.number().int().positive().optional(),
  artista_id: z.number().int().positive().optional(),
  evento_id: z.number({ error: 'evento_id deve ser um número válido' }).int().positive(),
  mensagem: z.string().max(1000).optional(),
  valor_proposto: z.number().positive('valor_proposto deve ser um número positivo'),
});
```

### BandApplicationService.apply() — assinatura e create()

```typescript
// Assinatura estendida
async apply(
  banda_id: number | undefined,
  evento_id: number,
  requestingUserId?: number,
  artista_id?: number,
  mensagem?: string,
  valor_proposto?: number  // novo parâmetro
)

// No branch de artista individual (linha ~41):
aplicacao = await BandApplicationModel.create({
  artista_id: artistaIdResolvido,
  evento_id,
  mensagem,
  valor_proposto,  // adicionar aqui
} as any);

// No branch de banda (linha ~74):
aplicacao = await BandApplicationModel.create({
  banda_id,
  evento_id,
  mensagem,
  valor_proposto,  // adicionar aqui também
} as any);
```

### getApplicationsByArtist — normalização e valor_proposto

```typescript
// Mapeamento atualizado em BandApplicationService.ts
return aplicacoes.map((a: any) => ({
  id: a.id,
  status: a.status === 'rejeitado' ? 'recusado' : a.status,  // normalizar
  mensagem: a.mensagem,
  data_aplicacao: a.data_aplicacao,
  evento_id: a.evento_id,
  nome_evento: a.Event?.titulo_evento ?? null,
  data_show: a.Event?.data_show ?? null,
  horario_inicio: a.Event?.horario_inicio ?? null,
  horario_fim: a.Event?.horario_fim ?? null,
  nome_estabelecimento: a.Event?.EstablishmentProfile?.nome_estabelecimento ?? null,
  valor_proposto: a.valor_proposto ?? null,  // novo
}));
```

### Input de valor_proposto em ApplyConfirmation.tsx

```typescript
// Estado
const [valorProposto, setValorProposto] = useState("");

// TextInput a adicionar na UI (antes do botão enviar)
<TextInput
  style={styles.valorInput}
  placeholder="Ex: 350"
  placeholderTextColor={DS.textDis}
  keyboardType="numeric"
  value={valorProposto}
  onChangeText={setValorProposto}
/>

// Validação em handleEnviar (adicionar antes de setLoading)
const valorNum = parseFloat(valorProposto);
if (!valorProposto.trim() || isNaN(valorNum) || valorNum <= 0) {
  Alert.alert("Atenção", "Informe um valor proposto válido.");
  return;
}

// Payload atualizado
await bandApplicationService.applyToEvent({
  evento_id: eventId,
  mensagem: mensagem.trim(),
  valor_proposto: valorNum,
});
```

### bookingService.getBookings com params

```typescript
// TocaAqui/http/bookingService.ts — assinatura atualizada
const getBookings = async (params?: { status?: string }) => {
  const response = await api.get<BookingsResponse>("/agendamentos", { params });
  return response.data.data ?? [];
};

// BrowseEvents.tsx — chamada atualizada
const data = await bookingService.getBookings({ status: 'pendente' });
// Remover o filtro client-side b.status === "pendente" (torna-se redundante)
```

### BookingController.getBookings com JOIN

```typescript
// backend-TocaAqui/src/controllers/BookingController.ts
// EstablishmentProfileModel já está importado (linha 5)
// Associação já existe em associations.ts (BookingModel.belongsTo com as: 'EstablishmentProfile')

const { count, rows } = await BookingModel.findAndCountAll({
  where,
  include: [{
    model: EstablishmentProfileModel,
    as: 'EstablishmentProfile',
    attributes: ['id', 'nome_estabelecimento'],
  }],
  order: [['data_show', 'DESC']],
  limit,
  offset,
});
```

O resultado deve ser mapeado para expor `nome_estabelecimento` no nível raiz, ou o frontend deve acessar via `item.EstablishmentProfile?.nome_estabelecimento`. Mapear no backend é mais limpo.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Filtro de status client-side | Query param `?status=pendente` enviado ao servidor | Phase 2 | Menos payload, sem leakage de eventos privados |
| `useEffect` simples em MyApplications | `useFocusEffect` | Phase 2 | Re-fetch correto ao retornar para a tela |
| `nome_estabelecimento` ausente nos cards | JOIN em getBookings retorna nome real | Phase 2 | Cards deixam de mostrar `Estab. #123` |
| Sem `valor_proposto` em candidaturas | Campo obrigatório no form e salvo no banco | Phase 2 | REQ-05 atendido end-to-end |

**Status enum mismatch (ativo — Phase 2 resolve via normalização):**
- Backend enum: `ApplicationStatus.REJEITADO = 'rejeitado'`
- Backend service `reject()`: salva `'rejeitado'`
- Frontend MyApplications: filtra por `'recusado'`
- Resolução: normalizar `'rejeitado'` → `'recusado'` no retorno de `getApplicationsByArtist`

---

## Open Questions

1. **O JOIN em `getBookings` afeta outros consumidores do endpoint?**
   - O que sabemos: `bookingService.getBookings()` é chamado apenas por `BrowseEvents.tsx` no frontend (verificado por grep — não há outros usos diretos identificados)
   - O que está incerto: se o payload maior do JOIN impacta telas de estabelecimento que consomem `/agendamentos` diretamente via API
   - Recomendação: Adicionar o JOIN — é seguro; o frontend que não precisar de `nome_estabelecimento` simplesmente ignora o campo extra

2. **`applyToEvent` já tem a rota correta no branch atual?**
   - O que sabemos: No arquivo lido, linha 23 ainda mostra `api.post<BandApplication>("/eventos", data)` — rota incorreta
   - O que está incerto: Se a Phase 1 havia corrigido isso em outro branch que não foi mergeado
   - Recomendação: Plano 02-02 deve verificar e corrigir para `/candidaturas` como parte explícita das tarefas

3. **Migration `valor_proposto` deve ser `allowNull: true` ou `false`?**
   - O que sabemos: Candidaturas existentes no banco não têm valor — `allowNull: false` sem `defaultValue` quebraria a migration em banco com dados
   - Recomendação: Usar `allowNull: true` — alinhado com as outras colunas opcionais do modelo; o campo se torna obrigatório apenas no schema Zod (validação de negócio), não no nível de banco

---

## Environment Availability

Step 2.6: SKIPPED (fase é puramente code/config — sem novas dependências externas. Postgres e Redis já ativos desde Phase 1.)

---

## Validation Architecture

Step 4: SKIPPED — `workflow.nyquist_validation` é explicitamente `false` em `.planning/config.json`.

---

## Sources

### Primary (HIGH confidence) — leitura direta dos arquivos do repositório

| Arquivo | O que foi verificado |
|---------|----------------------|
| `backend-TocaAqui/src/models/BandApplicationModel.ts` | Ausência de `valor_proposto` na classe e em `init()` |
| `backend-TocaAqui/src/migrations/20240101000008-create-aplicacoes-banda-evento.js` | Migration original sem `valor_proposto` |
| `backend-TocaAqui/src/migrations/20240101000029-add-artista-candidatura-fields.js` | Adicionou `artista_id` e `mensagem`, sem `valor_proposto` |
| `backend-TocaAqui/src/schemas/bandApplicationSchemas.ts` | Zod schema sem `valor_proposto` |
| `backend-TocaAqui/src/services/BandApplicationService.ts` | `apply()` sem `valor_proposto`; `getApplicationsByArtist()` sem o campo no retorno; status enum `'rejeitado'` |
| `backend-TocaAqui/src/controllers/BandApplicationController.ts` | `valor_proposto` não lido do `req.body` |
| `backend-TocaAqui/src/controllers/BookingController.ts` | `getBookings` sem JOIN; `status` query param já tratado via `where.status` |
| `backend-TocaAqui/src/models/associations.ts` | Associação `BookingModel.belongsTo(EstablishmentProfileModel, { as: 'EstablishmentProfile' })` confirmada |
| `backend-TocaAqui/src/routes/BandApplicationRoutes.ts` | Rotas e middleware `validate(applyBandSchema)` confirmados |
| `TocaAqui/http/bandApplicationService.ts` | Rota `/eventos` incorreta; `BandApplication` interface com `valor_proposto?: number`; `getMyApplications` retorna `response.data` |
| `TocaAqui/http/bookingService.ts` | `getBookings()` sem params; interface `Booking` sem `nome_estabelecimento` |
| `TocaAqui/screens/artist/BrowseEvents.tsx` | Filtro client-side; card usa `estabelecimento_id` (campo incorreto) |
| `TocaAqui/screens/artist/ApplyConfirmation.tsx` | Params recebidos; payload enviado sem `valor_proposto`; rota indiretamente verificada |
| `TocaAqui/screens/artist/MyApplications.tsx` | `useEffect` sem `useFocusEffect`; filtros de status por tab |
| `TocaAqui/screens/artist/EventDetailArtist.tsx` | Params navegados para `ApplyConfirmation` confirmados |
| `TocaAqui/navigation/ArtistNavigator.tsx` | `ArtistStackParamList` e tipo de `ApplyConfirmation` confirmados |
| `TocaAqui/screens/establishment/EstGigs.tsx` (grep) | Padrão `useFocusEffect` confirmado em uso no projeto |

---

## Metadata

**Confidence breakdown:**
- Gap de `valor_proposto` em todas as camadas: HIGH — leitura direta de 6 arquivos confirmando ausência
- Gap do JOIN em getBookings: HIGH — leitura direta do BookingController
- Padrão `useFocusEffect`: HIGH — grep confirmou uso em EstGigs.tsx e Profile.tsx
- Mismatch `rejeitado/recusado`: HIGH — enum e service lidos diretamente
- Rota errada `applyToEvent`: HIGH — linha 23 de bandApplicationService.ts lida diretamente

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (codebase estável, sem dependências externas em movimento)
