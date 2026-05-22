# Entities, Value Objects e Aggregates — Event Scheduling Context

Este documento detalha os elementos táticos de DDD aplicados ao **Event Scheduling Context**, o contexto central do negócio Toca Aqui, onde ocorre o match entre artistas/bandas e estabelecimentos.

---

## Contexto: Event Scheduling

**Aggregate Root:** `Agendamento` (Booking)

O Agendamento é o ponto central do contexto. Todas as operações de candidatura giram em torno de um agendamento publicado por um estabelecimento.

---

## Aggregate: Agendamento

### Entity: `Agendamento` (Aggregate Root)

Representa uma vaga de show publicada por um estabelecimento.

| Atributo | Tipo | Descrição |
|---|---|---|
| `id` | number | Identificador único |
| `perfil_estabelecimento_id` | number | Referência ao estabelecimento dono da vaga |
| `titulo` | string | Título da vaga |
| `descricao` | string | Descrição do evento |
| `data_evento` | Date | Data e hora do show |
| `hora_inicio` | string | Hora de início (HH:MM) |
| `hora_fim` | string | Hora de fim (HH:MM) |
| `generos_musicais` | string[] | Gêneros musicais desejados |
| `cache_minimo` | number | Cachê mínimo aceito (R$) |
| `cache_maximo` | number | Cachê máximo oferecido (R$) |
| `status` | enum | `aberto`, `fechado`, `cancelado` |

**Invariantes:**
- `hora_fim` deve ser posterior a `hora_inicio` (suporte a shows que cruzam meia-noite via comparação em minutos).
- `cache_minimo` ≤ `cache_maximo`.
- Um agendamento com status `fechado` ainda exibe candidaturas existentes com flag `closed: true`.

### Entity: `BandApplication` (membro do aggregate)

Representa a candidatura de um artista ou banda a um agendamento.

| Atributo | Tipo | Descrição |
|---|---|---|
| `id` | number | Identificador único |
| `evento_id` | number | Referência ao Agendamento |
| `artista_id` | number \| null | Referência ao PerfilArtista (candidatura solo) |
| `banda_id` | number \| null | Referência à Banda (candidatura de banda) |
| `cache_pretendido` | number | Valor proposto pelo artista/banda |
| `mensagem` | string | Mensagem de apresentação |
| `status` | enum | `pendente`, `aceito`, `rejeitado`, `cancelado` |

**Invariantes:**
- Deve ter `artista_id` OU `banda_id` (nunca ambos nulos).
- O `artista_id` é resolvido internamente pelo `BandApplicationService` a partir do JWT do usuário autenticado — nunca aceito do body da requisição.
- Ao ser aceito, aciona `ContractService.generateFromApplication()`.

---

## Value Objects

### `HorarioShow`

Representa o intervalo de tempo de um show, com validação de cruzamento de meia-noite.

| Campo | Tipo |
|---|---|
| `hora_inicio` | string (HH:MM) |
| `hora_fim` | string (HH:MM) |

**Regra:** A validação converte horários em minutos totais desde meia-noite. Se `hora_fim` < `hora_inicio`, o show termina no dia seguinte (válido).

### `FaixaDeCachê`

Representa o intervalo de cachê aceito pelo estabelecimento.

| Campo | Tipo |
|---|---|
| `cache_minimo` | number |
| `cache_maximo` | number |

**Regra:** `cache_minimo` ≤ `cache_maximo`; ambos ≥ 0.

### `StatusCandidatura`

Enum de estados da candidatura: `pendente` → `aceito` | `rejeitado` | `cancelado`.

---

## Domain Services

### `BandApplicationService`

Orquestra as operações sobre candidaturas:

- `apply()`: resolve o artista pelo JWT, valida dados e persiste candidatura.
- `accept(applicationId)`: muda status para `aceito` e chama `ContractService.generateFromApplication()`.
- `reject(applicationId)`: muda status para `rejeitado`.
- `getApplicationsForEvent(eventoId)`: retorna candidaturas com flag `closed` se evento fechado.
- `getApplicationsByArtist(userId)`: retorna candidaturas do artista autenticado.

---

## Aggregate: Contract *(Contract Context)*

Gerado automaticamente pelo Event Scheduling Context ao aceitar uma candidatura.

### Entity: `Contrato` (Aggregate Root do Contract Context)

| Atributo | Tipo | Descrição |
|---|---|---|
| `id` | number | Identificador único |
| `aplicacao_id` | number | Candidatura origem |
| `evento_id` | number | Agendamento vinculado |
| `artista_id` | number \| null | Artista contratado |
| `banda_id` | number \| null | Banda contratada |
| `perfil_estabelecimento_id` | number | Estabelecimento contratante |
| `cache_total` | number | Cachê acordado |
| `data_evento` | Date | Data do show |
| `status` | enum | `rascunho`, `ativo`, `concluido`, `cancelado` |

### Entity: `ContractHistory` (membro do aggregate)

Registra cada mudança de status do contrato com timestamp e usuário responsável.

---

## Resumo dos elementos táticos

| Elemento | Quantidade | Exemplos |
|---|---|---|
| Aggregates | 2 | Agendamento, Contrato |
| Entities | 4 | Agendamento, BandApplication, Contrato, ContractHistory |
| Value Objects | 3 | HorarioShow, FaixaDeCachê, StatusCandidatura |
| Domain Services | 1 | BandApplicationService |
