# Bounded Contexts — Plataforma Toca Aqui

A plataforma **Toca Aqui** é composta por dois sistemas principais:

- **Main API** (monólito modular)
- **Social Service** (microserviço independente)

A seguir estão os **Bounded Contexts** que definem os limites de domínio entre os módulos e microserviços do sistema.

---

## 1. User Management Context

**Domínio:** Supporting Domain  
**Local:** Main API

### **Responsabilidade**

Gerenciar autenticação, autorização e ciclo de vida de usuários da plataforma.

### **Inclui**

- Registro de usuários
- Login
- Geração e validação de JWT Tokens
- Papéis: `artist`, `establishment_owner`, `common_user`, `admin`

### **Entidades**

- `Usuario`
- `Role`

### **Interações**

- Upstream para todos os outros contextos (todos dependem do usuário autenticado).

---

## 2. Address Context

**Domínio:** Supporting Domain  
**Local:** Main API

### **Responsabilidade**

Gerenciar endereços de artistas, estabelecimentos e eventos.

### **Inclui**

- Criação de endereços
- Consulta
- Relacionamento com perfis

### **Entidades**

- `Endereco`

### **Interações**

- Fornece endereços para **Profile Context**
- Fornece endereços para **Event Scheduling Context**

---

## 3. Profile Context

**Domínio:** Core Domain  
**Local:** Main API

### **Responsabilidade**

Gerenciar perfis de Estabelecimentos e Artistas que operam na plataforma.

### **Inclui**

- Perfil de Estabelecimento
- Perfil de Artista
- Horários de funcionamento
- Gêneros musicais
- Informações de contato
- Endereço vinculado

### **Entidades**

- `PerfilEstabelecimento`
- `PerfilArtista`

### **Por que é um contexto separado**

Possui regras próprias e forte impacto no fluxo principal (bandas se candidatam a eventos de estabelecimentos).

### **Interações**

- Fornece dados para **Band Context**
- Fornece dados para **Event Scheduling Context**

---

## 4. Band Context

**Domínio:** Core Domain  
**Local:** Main API

### **Responsabilidade**

Gerenciar bandas criadas por artistas.

### **Inclui**

- Criação de bandas
- Listagem
- Biografia
- Gêneros musicais
- Número de integrantes

### **Entidades**

- `Banda`

### **Interações**

- Interage com **Profile Context** (artista pertence a um perfil)
- Fornece dados para **Event Scheduling** (bandas se candidatam)

---

## 5. Event Scheduling Context

**Domínio:** Core Domain (coração do negócio)  
**Local:** Main API

### **Responsabilidade**

Gerenciar eventos criados por estabelecimentos, inscrições de bandas e processo de aceitação.

### **Inclui**

- Criação de eventos (agendamentos)
- Listagem
- Aplicações de bandas
- Aceitação/rejeição de bandas
- Títulos, horários, perfis, descrição
- Consultas e relatórios

### **Entidades**

- `Agendamento`
- `AplicacaoBanda`

### **Por que é o contexto central**

É onde ocorre o _match_ artista ↔ estabelecimento, objetivo principal da plataforma.

### **Interações**

- Recebe bandas do **Band Context**
- Recebe perfis do **Profile Context**
- Envia dados para o **Social Service**

---

## 6. Social Context (Microserviço)

**Domínio:** Generic Domain  
**Local:** Microserviço `socialApi`

### **Responsabilidade**

Gerenciar todas as interações sociais independentes do fluxo de negócio.

### **Inclui**

- Comentários
- Avaliações
- Favoritos
- Consulta e exclusão

### **Entidades**

- `Comentario`
- `Avaliacao`
- `Favorito`

### **Motivos para ser um microserviço isolado**

- Alto volume de acessos
- Baixa dependência transacional
- Reutilizável e desacoplado
- Pode escalar de forma independente

### **Interações**

- Consome IDs de: bandas, perfis e usuários da Main API
- Retorna dados agregados ao App

---

## 7. Reporting & Admin Context

**Domínio:** Supporting Domain  
**Local:** Main API

### **Responsabilidade**

Fornecer funcionalidades administrativas e de consultas avançadas.

### **Inclui**

- Listagens administrativas
- Consultas detalhadas de agendamentos
- Buscas por ID
- Controle de acesso via token de admin

### **Entidades**

- Não possui entidades próprias (somente leitura e agregações).

### **Interações**

Depende dos contextos:

- User
- Profile
- Band
- Event
- Address

---
