# 🎵 Toca Aqui

> Marketplace bilateral que conecta artistas e músicos a estabelecimentos (bares, casas de show) para contratação de shows ao vivo no Brasil.

---

## 📌 Sobre o Projeto

O **Toca Aqui** resolve um problema estrutural do mercado de música ao vivo no Brasil: a contratação de artistas por estabelecimentos é 100% informal, sem contratos, sem reputação verificada e com pagamentos frequentemente atrasados ou caloteados.

A plataforma opera no modelo de **marketplace ativo**: o estabelecimento publica uma vaga de show (com data, cachê e rider técnico), e os artistas se candidatam. Ao aceitar uma candidatura, o sistema **gera automaticamente um mini-contrato em PDF** com validade legal, baseado no Código Civil Brasileiro, Lei de Direitos Autorais e Lei de Mediação.

**Diferenciais principais:**
- Mini-contrato automático (nenhum concorrente oferece)
- Modelo ativo: estabelecimento posta vaga → artista se candidata
- Sistema de avaliações bidirecional pós-show
- Mercado-alvo: cidades médias brasileiras (100–500 mil hab.)

---

## 🏗️ Arquitetura

### Padrão Adotado: Monolito Modular + Microsserviço Social

A arquitetura foi definida por ADR (Architecture Decision Record) e segue o padrão de **monolito modular com extração de microsserviço para o domínio social**.

```
┌─────────────────────────────────────────────────────────┐
│                    App Mobile (React Native)            │
│                   iOS + Android via Expo Go             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST
                         ▼
┌──────────────────────────────────────────────────────────┐
│              Nginx API Gateway (porta 80/443)            │
│    Roteamento, rate limiting, SSL termination            │
└──────────────┬───────────────────────────────────────────┘
               │                          
               ▼                          
┌───────────────────────────┐  
│      Main API             │  
│   Node.js + Express       │  
│   TypeScript + Sequelize  │  
│   Porta: 3000             │  
│                           │  
│  Módulos:                 │  
│  - Auth (JWT + RBAC)      │  
│  - Usuários               │  
│  - Perfis (artista/estab) │  
│  - Bandas                 │  
│  - Eventos                │  
│  - Aplicações             │            
│  - Contratos (PDF)        │           
│  - Endereços              │
│  - Favoritos              │
│  - Avaliações             │
│  - Comentários            │                  
└───────────────────────────┘            
               │                        
               └──────────┬
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Infraestrutura de Dados                 │
│   MySQL (Main DB) │ MySQL (Social DB) │ Redis (Cache)   │
└─────────────────────────────────────────────────────────┘
```

### Por que essa arquitetura?

**Monolito para o core:** O domínio principal possui forte acoplamento entre usuários, perfis, eventos, bandas e contratos. Um monolito modular acelera as entregas do MVP e reduz complexidade operacional.

**Nginx como gateway:** Centraliza roteamento, aplica rate limiting no login (proteção contra força bruta), e prepara a estrutura para evolução futura (balanceamento de carga, múltiplas instâncias).

**Redis para cache:** Listagens de eventos são as rotas mais consultadas. O cache no Redis reduz a carga no MySQL e diminui latência percebida pelo usuário.

---

## 🛠️ Stack de Desenvolvimento

### Frontend
| Ferramenta | Versão | Função |
|---|---|---|
| React Native | 0.73+ | Framework mobile multiplataforma |
| Expo Go | SDK 50+ | Build e hot-reload em desenvolvimento |
| TypeScript | 5.x | Tipagem estática |

### Backend
| Ferramenta | Versão | Função |
|---|---|---|
| Node.js | 20 LTS | Runtime JavaScript server-side |
| Express | 4.x | Framework HTTP minimalista |
| TypeScript | 5.x | Tipagem estática |
| Sequelize | 6.x | ORM para MySQL |
| bcrypt | 5.x | Hash seguro de senhas |
| jsonwebtoken | 9.x | Geração e validação de JWT |
| pdfkit | 0.14+ | Geração de contratos em PDF |

### Banco de Dados
| Ferramenta | Função |
|---|---|
| MySQL 8 | Banco principal (transações, contratos, perfis) |
| Redis 7 | Cache de listagens e controle de rate limit |

### Infraestrutura
| Ferramenta | Função |
|---|---|
| Docker | Containerização de todos os serviços |
| Docker Compose | Orquestração local (sobe tudo com 1 comando) |
| Nginx | API Gateway, roteamento e rate limiting |
| GitHub Actions | CI/CD automatizado (build → test → deploy) |

### Design & Prototipação
| Ferramenta | Função |
|---|---|
| Stitch | Prototipação de telas mobile |
| draw.io | Diagramas de arquitetura e fluxo de negócio |

---

## 🔄 Fluxo da Regra de Negócio Principal

O diagrama completo está disponível em [`docs/toca_aqui_fluxo.drawio`](./docs/toca_aqui_fluxo.drawio) — abra no [draw.io](https://app.diagrams.net) para visualizar interativamente.

### Resumo do Fluxo End-to-End

```
[Usuário]
   │
   ├─► FASE 1: Cadastro / Login
   │     POST /register → bcrypt senha → JWT gerado (role + id)
   │
   ├─► FASE 2: Criação de Perfil
   │     POST /perfil-artista  ──► cria PerfilArtista + Endereço
   │     POST /perfil-estabelecimento ──► cria PerfilEstabelecimento + Endereço
   │
[Estabelecimento]
   │
   ├─► FASE 3: Publicação de Vaga
   │     POST /eventos
   │     { titulo, data_show, cachê, rider_tecnico, horario }
   │     Valida: data futura, role=establishment_owner
   │     Persiste: status='aberto' → Redis invalida cache
   │
[Artista]
   │
   ├─► FASE 4: Descoberta e Candidatura
   │     GET /eventos?status=aberto → Redis (cache hit) ou MySQL (cache miss)
   │     POST /aplicacoes { evento_id, banda_id }
   │     Valida: banda não aplicou 2x, evento ainda aberto
   │     Persiste: aplicacao_banda status='pendente'
   │
[Estabelecimento]
   │
   ├─► FASE 5: Aceite + Mini-Contrato (⭐ diferencial central)
   │     PATCH /aplicacoes/:id { status: 'aceito' }
   │     Valida: ownership do evento
   │     Fecha demais candidaturas
   │     ──► Dispara geração de PDF:
   │           - Coleta: dados artista, estabelecimento, cachê, sinal (50%)
   │           - Adiciona: cláusulas de cancelamento, multas, ECAD
   │           - Gera: PDF assinado digitalmente (válido pela Lei Brasileira)
   │           - Armazena: contrato no storage
   │     Persiste: contrato status='ativo'
   │     Notifica: ambos os atores via push notification
   │
[Ambos — pós-show]
   │
   └─► FASE 6: Avaliações Bidirecionais
         POST /avaliacoes { nota, comentario, avaliado_id }
         Nginx roteia → Social Service (porta 3001)
         Persiste: avaliacao no Social DB
         Exibe: nota pública nos perfis de ambos
```

### Invariantes de Negócio
- Uma banda não pode se candidatar duas vezes ao mesmo evento
- O aceite fecha automaticamente todas as demais candidaturas do evento
- O contrato só é gerado após aceite confirmado pelo estabelecimento
- A data do show não pode ser no passado ao criar o evento
- Eventos com status `concluído` não aceitam mais alterações

---

## 🔐 Autenticação e Autorização

**Estratégia:** JWT (JSON Web Tokens) + RBAC (Role-Based Access Control)

```
Login ──► bcrypt valida senha ──► JWT gerado
                                    │
                            { sub, email, role, exp }
                                    │
                         Enviado no header:
                    Authorization: Bearer <token>
```

**Papéis disponíveis:**

| Role | Permissões |
|---|---|
| `admin` | Acesso completo ao sistema |
| `establishment_owner` | Cria/gerencia estabelecimentos e eventos |
| `artist` | Gerencia perfil artístico, candidata-se a eventos |
| `common_user` | Favoritos, comentários e avaliações |

**Configurações de segurança:**
- Senhas: bcrypt (salt rounds 12)
- Token: HS256, expiração 8h, secret via variável de ambiente
- Rate limiting: configurado no Nginx para o endpoint `/login`
- Branch `main` protegida: exige PR + CI passando + 1 aprovação

---

## 📁 Estrutura do Projeto

```
toca-aqui/
├── 📱 mobile/                          # App React Native
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/                   # Login, Cadastro
│   │   │   ├── artist/                 # Feed, Perfil artista, Candidaturas
│   │   │   ├── establishment/          # Dashboard, Publicar vaga, Candidatos
│   │   │   └── common/                 # Home, Busca, Perfil público
│   │   ├── components/                 # Componentes reutilizáveis
│   │   ├── hooks/                      # Custom hooks (useAuth, useEvents...)
│   │   ├── services/                   # Chamadas à API (axios)
│   │   ├── navigation/                 # React Navigation (stack + tabs)
│   │   ├── context/                    # AuthContext, ThemeContext
│   │   └── utils/                      # Formatadores, validadores
│   ├── app.json
│   └── package.json
│
├── ⚙️ backend/                         # Main API — Monolito Modular
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                   # Login, register, JWT middleware
│   │   │   ├── users/                  # CRUD usuários
│   │   │   ├── profiles/
│   │   │   │   ├── artist/             # Perfil artista
│   │   │   │   └── establishment/      # Perfil estabelecimento
│   │   │   ├── bands/                  # CRUD bandas
│   │   │   ├── addresses/              # CRUD endereços
│   │   │   ├── events/                 # Criação e listagem de eventos
│   │   │   ├── applications/           # Candidaturas de bandas
│   │   │   └── contracts/              # Geração de PDF e armazenamento
│   │   ├── shared/
│   │   │   ├── middlewares/            # auth, authorize, errorHandler
│   │   │   ├── validators/             # Schemas de validação (Joi/Zod)
│   │   │   └── utils/                  # Helpers gerais
│   │   ├── database/
│   │   │   ├── models/                 # Sequelize models
│   │   │   └── migrations/             # Migrations MySQL
│   │   ├── config/                     # DB, Redis, JWT configs
│   │   └── app.ts                      # Bootstrap Express
│   ├── Dockerfile
│   └── package.json
│
├── 🔀 nginx/
│   └── nginx.conf                      # Gateway, roteamento e rate limit
│
├── 📄 docs/                            # Documentação técnica
│   ├── toca_aqui_fluxo.drawio          # Diagrama end-to-end (draw.io)
│   ├── ADR-1-backend.md
│   ├── ADR-2-frontend.md
│   ├── ADR-3-banco-de-dados.md
│   ├── ADR-4-mensageria.md
│   ├── ADR-5-deploy.md
│   ├── Bounded_Contexts.md
│   ├── Autenticacao_Autorizacao.md
│   ├── Threat_Model.md
│   ├── Quality_Scenarios.md
│   ├── SLOs_SLIs.md
│   ├── Runbook_Incidentes.md
│   ├── Observabilidade.md
│   ├── Resiliencia.md
│   └── Pipeline_Security_Checklist.md
│
├── docker-compose.yml                  # Orquestra todos os serviços
├── .github/
│   └── workflows/
│       └── pipeline.yaml               # CI/CD: build → test → deploy
└── README.md
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20 LTS (para desenvolvimento fora do container)

### Subindo tudo com Docker Compose

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/toca-aqui.git
cd toca-aqui

# Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações locais

# Sobe toda a infraestrutura
docker-compose up -d

# Verifica se os containers estão rodando
docker-compose ps
```

**Serviços disponíveis após o `up`:**

| Serviço | URL Local |
|---|---|
| Main API | http://localhost:3000 |
| Social Service | http://localhost:3001 |
| Nginx Gateway | http://localhost:80 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

---

## 🔁 CI/CD Pipeline

Pipeline automatizado via **GitHub Actions** (`.github/workflows/pipeline.yaml`):

```
push/PR ──► build (npm install) ──► test ──► deploy (staging)
```

**Regras de segurança do pipeline:**
- `npm audit` bloqueia vulnerabilidades críticas no build
- Push direto na `main` bloqueado (exige PR + aprovação)
- Secrets armazenados no GitHub Secrets (nunca no código)
- Deploy só acontece após build e testes aprovados

---

## 📊 Bounded Contexts (DDD)

O projeto segue princípios de **Domain-Driven Design** com os seguintes contextos delimitados:

| Contexto | Tipo | Serviço | Responsabilidade |
|---|---|---|---|
| User Management | Supporting Domain | Main API | Autenticação, JWT, roles |
| Address | Supporting Domain | Main API | Endereços de perfis e eventos |
| Profile | Core Domain | Main API | Perfis de artistas e estabelecimentos |
| Band | Core Domain | Main API | Bandas criadas por artistas |
| Event Scheduling | **Core Domain** ⭐ | Main API | Eventos, candidaturas, aceites — coração do negócio |
| Social | Generic Domain | Social Service | Comentários, avaliações, favoritos |
| Reporting & Admin | Supporting Domain | Main API | Consultas e painel administrativo |

---

## 🛡️ Segurança

A segurança foi modelada desde o início usando o framework **STRIDE**:

| Ameaça | Mitigação aplicada |
|---|---|
| Spoofing | bcrypt para senhas, JWT assinado, rate limiting no login |
| Tampering | HTTPS obrigatório, validação de payloads no backend, JWT com assinatura |
| Repudiation | Logs de auditoria com ID do usuário e timestamp em todas as operações |
| Information Disclosure | RBAC rigoroso, respostas sem dados sensíveis, senhas hasheadas |
| Denial of Service | Rate limiting via Nginx, circuit breaker no serviço social |
| Elevation of Privilege | Middleware de autorização em todas as rotas protegidas |

---

## 📈 Observabilidade

O plano de observabilidade cobre três pilares:

**Logs:** Estruturados em JSON com nível (info/warn/error), timestamp, request ID e user ID.

**Métricas (SLIs/SLOs definidos):**
- Disponibilidade ≥ 99,5% por mês
- P95 de latência ≤ 500ms nas rotas principais
- Taxa de erro ≤ 0,5%

**Traces:** Rastreamento de requests entre Main API e Social Service via correlation ID no header.

---

## 👥 Equipe

| Nome | Papel |
|---|---|
| Vitor | Co-fundador, Backend Developer |
| Pedro Henrique Laera | Co-fundador, Frontend Developer (React Native) |

---

## 📚 Documentação Técnica Completa

Todos os documentos de decisão de arquitetura e operação estão na pasta [`/docs`](./docs/):

- `ADR-1` a `ADR-5`: Decisões de arquitetura (backend, frontend, banco, mensageria, deploy)
- `Bounded_Contexts.md`: Mapeamento completo de domínios DDD
- `Threat_Model.md`: Análise de ameaças STRIDE
- `Quality_Scenarios.md`: Cenários de qualidade (performance, disponibilidade, segurança)
- `SLOs_SLIs.md`: Métricas de nível de serviço
- `Runbook_Incidentes.md`: Procedimentos de resposta a incidentes
- `Observabilidade.md`: Estratégia de logs, métricas e traces
- `toca_aqui_fluxo.drawio`: Diagrama end-to-end de toda a plataforma

---

*Toca Aqui — Formalizando a música ao vivo no Brasil. 🎸*
