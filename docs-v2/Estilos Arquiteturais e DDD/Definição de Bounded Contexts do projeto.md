# Bounded Contexts — Plataforma Toca Aqui

A plataforma **Toca Aqui** é implementada como um **monolito modular**, com domínios separados logicamente dentro de um único serviço backend. Os Bounded Contexts definem os limites de responsabilidade e linguagem ubíqua de cada módulo.

---

## 1. User Management Context

**Domínio:** Supporting Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar autenticação, autorização e ciclo de vida dos usuários da plataforma.

### Inclui

- Registro e login de usuários
- Geração e validação de JWT (access token + refresh token)
- Roles: `common_user`, `admin`
- Preferências do usuário (gêneros, localização, raio de busca)

### Entidades

- `Usuario`
- `PreferenciaUsuario`

### Interações

- Upstream para todos os outros contextos (todos dependem do usuário autenticado via JWT).

---

## 2. Address Context

**Domínio:** Supporting Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar endereços vinculados a perfis de estabelecimentos e artistas.

### Inclui

- Criação e consulta de endereços
- Relacionamento com perfis

### Entidades

- `Endereco`

### Interações

- Fornece endereços para o **Profile Context**.

---

## 3. Profile Context

**Domínio:** Core Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar os perfis de **Artistas** e **Estabelecimentos**, que são os dois atores principais da plataforma. Um usuário pode ter um ou ambos os perfis.

### Inclui

- Perfil de Artista (nome artístico, bio, gêneros, cache, foto, cidade/estado)
- Perfil de Estabelecimento (nome, tipo, horário de funcionamento, gêneros preferidos, capacidade)
- Membros gerenciadores do estabelecimento (owner + admins)
- Onboarding de artistas e estabelecimentos

### Entidades

- `PerfilArtista`
- `PerfilEstabelecimento`
- `EstablishmentMember`

### Interações

- Fornece perfis para **Band Context**, **Event Scheduling Context** e **Contract Context**.

---

## 4. Band Context

**Domínio:** Core Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar bandas criadas e compostas por artistas. Artista e Banda são atores distintos: um artista solo se candidata diretamente; uma banda se candidata como entidade própria, composta por múltiplos artistas.

### Inclui

- Criação e listagem de bandas
- Biografia, gêneros e número de integrantes
- Membros da banda (artistas vinculados)

### Entidades

- `Banda`
- `BandMember`

### Interações

- Interage com **Profile Context** (membros são perfis de artistas).
- Fornece a entidade Banda para **Event Scheduling Context** e **Contract Context**.

---

## 5. Event Scheduling Context

**Domínio:** Core Domain (coração do negócio)
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar o ciclo de vida das vagas de shows: criação pelo estabelecimento, candidatura por artistas ou bandas, e processo de aceitação/rejeição. É onde ocorre o **match** artista ↔ estabelecimento.

### Inclui

- Criação de eventos/vagas (agendamentos) por estabelecimentos
- Candidatura de artistas e bandas (BandApplication)
- Aceitação e rejeição de candidaturas
- Listagem e filtros de vagas disponíveis

### Entidades

- `Agendamento` (Booking)
- `BandApplication` (Candidatura)

### Interações

- Recebe perfis do **Profile Context** e entidades do **Band Context**.
- Ao aceitar candidatura, aciona o **Contract Context** para gerar contrato.
- Fornece agendamentos para o **Ticketing Context**.

---

## 6. Contract Context

**Domínio:** Core Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar o mini-contrato automático gerado após aceitação de uma candidatura. É o diferencial principal da plataforma, fornecendo segurança jurídica básica para ambas as partes.

### Inclui

- Geração automática de contrato ao aceitar candidatura
- Histórico de alterações de status do contrato
- Cancelamento de contrato com registro de motivo
- Cláusula de cancelamento (valor do cachê acordado)

### Entidades

- `Contrato`
- `ContractHistory`

### Interações

- Originado pelo **Event Scheduling Context** (aceite de candidatura).
- Vinculado ao **Payment Context** (pagamento do cachê — planejado).

---

## 7. Ticketing Context

**Domínio:** Core Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar a compra e emissão de ingressos por usuários comuns para shows agendados e confirmados.

### Inclui

- Compra de ingresso (inteira/meia-entrada)
- Dados do comprador
- QR code de ingresso
- Histórico de ingressos do usuário (próximos/passados)

### Entidades

- `Ingresso`

### Interações

- Depende do **Event Scheduling Context** (agendamentos confirmados).
- Depende do **Payment Context** para processar cobrança (planejado via Stripe).

---

## 8. Social Context

**Domínio:** Generic Domain
**Tipo:** Interno ao monolito

### Responsabilidade

Gerenciar todas as interações sociais da plataforma, incluindo avaliações bidirecionais, comentários, curtidas, favoritos, seguidores e notificações.

### Inclui

- Avaliações de shows (fã → show; estabelecimento → artista; artista → estabelecimento)
- Comentários em shows com suporte a respostas (threaded) e curtidas
- Favoritos (shows, artistas, estabelecimentos)
- Seguidores de artistas
- Notificações de sistema (candidatura recebida, contrato gerado, etc.)

### Entidades

- `AvaliacaoShow`
- `ComentarioShow`
- `CurtidaComentario`
- `Favorito`
- `SeguidorArtista`
- `Notificacao`

### Interações

- Consome IDs de usuários, perfis e agendamentos dos demais contextos.
- Notificações disparadas via Redis Pub/Sub pelo **PubSubService**.

---

## 9. Payment Context *(planejado)*

**Domínio:** Generic Domain
**Tipo:** Interno ao monolito (integração externa: Stripe)

### Responsabilidade

Processar pagamentos de ingressos e assinaturas de artistas (plano freemium).

### Inclui

- Cobrança de ingressos via Stripe
- Gestão de assinaturas de artistas (plano até 3 candidaturas/mês gratuito, plano premium R$ 29-39/mês)
- Webhooks do Stripe para confirmação de pagamento

### Entidades

- `Payment`

### Interações

- Acionado pelo **Ticketing Context** para pagamento de ingressos.
- Acionado pelo **Profile Context** para gestão de assinaturas.

### Status atual

Integração com Stripe está mockada. `StripeService` e `PaymentService` existem no código mas não processam pagamentos reais.
