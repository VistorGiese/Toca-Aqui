# Diagrama de Classes — Camada de Serviço

> Representa os principais serviços do domínio e suas dependências.
> Arquitetura: Monolito modular com separação Routes → Controllers → Services → Models.

## Diagrama

```mermaid
classDiagram
    class AuthService {
        +register(params: RegisterParams) Promise~User~
        +login(email, senha) Promise~LoginResult~
        +logout(token, exp) Promise~void~
        +forgotPassword(email) Promise~void~
        +resetPassword(token, nova_senha) Promise~void~
        +verifyEmail(token) Promise~void~
        +getUserProfile(userId) Promise~UserProfile~
        +createArtistProfile(userId, data) Promise~ArtistProfile~
        +createEstablishmentProfile(userId, data) Promise~EstablishmentProfile~
    }

    class BandApplicationService {
        +apply(banda_id, evento_id, userId, artista_id, mensagem, valor_proposto) Promise~BandApplication~
        +accept(applicationId) Promise~AcceptResult~
        +reject(applicationId) Promise~void~
        +getApplicationsForEvent(evento_id) Promise~BandApplication[]~
        +getApplicationsByArtist(userId) Promise~BandApplication[]~
    }

    class ContractService {
        +generateFromApplication(aplicacaoId) Promise~Contract~
        +getById(contractId) Promise~Contract~
        +getByEvent(eventoId) Promise~Contract~
        +getByUser(userId) Promise~Contract[]~
        +acceptContract(contractId, userId) Promise~Contract~
        +cancelContract(contractId, userId) Promise~Contract~
        +completeContract(contractId) Promise~Contract~
        +proposeEdit(contractId, userId, data) Promise~Contract~
        +getHistory(contractId) Promise~ContractHistory[]~
        +getUserRole(contractId, userId) Promise~Role~
    }

    class NotificationService {
        +createNotification(usuario_id, tipo, mensagem, dados) Promise~Notification~
    }

    class ShowService {
        +listShows(params) Promise~Show[]~
        +getShowById(id) Promise~Show~
        +createShow(data) Promise~Show~
        +updateShow(id, data) Promise~Show~
    }

    class AvaliacaoShowService {
        +create(userId, agendamento_id, data) Promise~Avaliacao~
        +getByShow(agendamento_id) Promise~Avaliacao[]~
        +getByUser(userId) Promise~Avaliacao[]~
    }

    class AppError {
        +message: string
        +statusCode: number
        +isOperational: boolean
        +constructor(message, statusCode)
    }

    class TokenPayload {
        +id: number
        +email: string
        +roles: string[]
        +iat: number
        +exp: number
    }

    %% Dependências entre serviços
    BandApplicationService ..> ContractService : "chama generateFromApplication() ao aceitar"
    BandApplicationService ..> NotificationService : "notifica artistas aceitos/recusados"
    ContractService ..> NotificationService : "notifica mudanças de status"
    AuthService ..> NotificationService : "notifica registro e verificação de email"

    %% Erros e tipos compartilhados
    BandApplicationService ..> AppError : "lança em validações"
    ContractService ..> AppError : "lança em validações"
    AuthService ..> AppError : "lança em validações"
    AuthService ..> TokenPayload : "usa para gerar JWT"
```

## Fluxo de Chamadas — Aceitar Candidatura

```mermaid
sequenceDiagram
    participant C as EstGigApplications (Frontend)
    participant R as BandApplicationRoutes
    participant Ctrl as BandApplicationController
    participant BAS as BandApplicationService
    participant CS as ContractService
    participant NS as NotificationService
    participant DB as MySQL

    C->>R: PUT /eventos/:id/aceitar { applicationId }
    R->>Ctrl: accept(req, res)
    Ctrl->>BAS: accept(applicationId)
    BAS->>DB: BandApplicationModel.findByPk(id)
    BAS->>DB: BandApplicationModel.update(status=aceito)
    BAS->>DB: BandApplicationModel.update(status=rejeitado) [demais candidaturas]
    BAS->>CS: generateFromApplication(applicationId)
    CS->>DB: ContractModel.create({ status: aguardando_aceite })
    CS-->>BAS: Contract
    BAS->>NS: createNotification(artista, "candidatura_aceita")
    BAS->>NS: createNotification(artistas_rejeitados, "candidatura_rejeitada")
    BAS-->>Ctrl: { aplicacao, contrato }
    Ctrl-->>C: 200 { aplicacao, contrato }
```

## Arquitetura de Camadas

```
┌─────────────────────────────────────────┐
│           Frontend (React Native)        │
└──────────────────┬──────────────────────┘
                   │ HTTP / REST
┌──────────────────▼──────────────────────┐
│           Routes (Express Router)        │
│  auth middleware → validate middleware   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Controllers                    │
│  Parse req → call service → format res  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Services (Domínio)             │
│  BandApplicationService, ContractService │
│  AuthService, NotificationService, ...   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Models (Sequelize ORM)         │
│  20 models mapeados para MySQL           │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  MySQL 8.0  │  Redis 7 (cache + sessions)│
└─────────────────────────────────────────┘
```
