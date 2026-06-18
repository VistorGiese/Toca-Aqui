# Diagrama de Classes — Camada de Serviço

> Representa os principais serviços do domínio e suas dependências.
> Arquitetura: Monolito modular com separação Routes → Controllers → Services → Models.

## Diagrama

```mermaid
classDiagram
    %% ── Domínio Principal ──────────────────────────────────────────

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

    class ComentarioShowService {
        +getComentariosByShow(agendamento_id, usuario_id) Promise~Comentario[]~
        +criarComentario(data) Promise~Comentario~
        +curtirComentario(comentario_id, usuario_id) Promise~CurtidaResult~
        +excluirComentario(comentario_id, usuario_id) Promise~void~
    }

    class IngressoService {
        +comprarIngresso(data) Promise~Ingresso~
        +getMeusIngressos(usuario_id, tipo) Promise~Ingresso[]~
        +getIngressoById(id, usuario_id) Promise~Ingresso~
    }

    class SeguidorArtistaService {
        +seguirOuDesseguir(usuario_id, perfil_artista_id) Promise~SeguidorResult~
        +isSeguindo(usuario_id, perfil_artista_id) Promise~boolean~
        +getSeguidores(perfil_artista_id) Promise~number~
        +getArtistasQueSigo(usuario_id) Promise~ArtistProfile[]~
        +getPerfilArtistaPublico(perfil_artista_id, usuario_id) Promise~PerfilPublico~
    }

    %% ── Financeiro ─────────────────────────────────────────────────

    class PaymentService {
        +createPayment(data: CreatePaymentData) Promise~Payment~
        +getByContract(contratoId) Promise~Payment[]~
        +getById(paymentId) Promise~Payment~
        +updateStatus(paymentId, status, stripeData) Promise~Payment~
        +findByStripePaymentIntent(intentId) Promise~Payment~
    }

    class StripeService {
        +createSignalPayment(contractId) Promise~PaymentResult~
        +createBalancePayment(contractId) Promise~PaymentResult~
        +getPaymentClientSecret(paymentId) Promise~string~
        +handleWebhook(payload, signature) Promise~void~
        +refundPayment(paymentId, amount) Promise~void~
    }

    %% ── Email (DIP) ─────────────────────────────────────────────────

    class IEmailProvider {
        <<interface>>
        +sendVerificationEmail(email, token) Promise~void~
        +sendPasswordResetEmail(email, token) Promise~void~
    }

    class NodemailerEmailProvider {
        +sendVerificationEmail(email, token) Promise~void~
        +sendPasswordResetEmail(email, token) Promise~void~
    }

    %% ── Infraestrutura ──────────────────────────────────────────────

    class LockService {
        +acquire(key, ttlMs) Promise~LockHandle~
        +release(key, token) Promise~void~
    }

    class PubSubService {
        +subscribe(channel, handler) Promise~void~
        +unsubscribe(channel) Promise~void~
        +initializeSubscribers() Promise~void~
        +isReady() boolean
        +disconnect() Promise~void~
    }

    class MetricsService {
        +record(route, durationMs, statusCode) void
        +getSummary() Record~string, object~
        +reset() void
    }

    class UploadService {
        +uploadSingle multer.Handler
        +uploadMultiple multer.Handler
        +deleteFile(filepath) boolean
        +getRelativePath(file) string
        +fileExists(filepath) boolean
        +getFileInfo(filepath) FileInfo
    }

    class CronService {
        +initCronJobs() void
    }

    class GeocodingService {
        +geocodificarEndereco(rua, numero, cidade, estado, cep) Promise~Coordenadas~
    }

    %% ── Tipos Compartilhados ────────────────────────────────────────

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

    class LockHandle {
        +acquired: boolean
        +token: string
    }

    %% ── Dependências entre serviços ─────────────────────────────────
    BandApplicationService ..> ContractService : "generateFromApplication() ao aceitar"
    BandApplicationService ..> NotificationService : "notifica aceitos/recusados"
    BandApplicationService ..> LockService : "lock distribuído no aceite"
    ContractService ..> NotificationService : "notifica mudanças de status"
    AuthService ..> NotificationService : "notifica registro e verificação"
    AuthService ..> IEmailProvider : "envia emails via interface"
    NodemailerEmailProvider ..|> IEmailProvider : "implementa"
    StripeService ..> PaymentService : "cria e atualiza pagamentos"
    StripeService ..> NotificationService : "notifica pagamento/falha"
    CronService ..> NotificationService : "lembretes de pagamento"
    CronService ..> ShowService : "marca eventos como realizados"
    PubSubService ..> MetricsService : "invalida cache via eventos"

    %% ── Erros e tipos compartilhados ────────────────────────────────
    BandApplicationService ..> AppError : "lança em validações"
    ContractService ..> AppError : "lança em validações"
    AuthService ..> AppError : "lança em validações"
    AuthService ..> TokenPayload : "usa para gerar JWT"
    LockService ..> LockHandle : "retorna ao adquirir lock"
```

## Fluxo de Chamadas — Aceitar Candidatura

```mermaid
sequenceDiagram
    participant C as EstGigApplications (Frontend)
    participant R as BandApplicationRoutes
    participant Ctrl as BandApplicationController
    participant BAS as BandApplicationService
    participant LS as LockService
    participant CS as ContractService
    participant NS as NotificationService
    participant DB as MySQL

    C->>R: PUT /eventos/:id/aceitar { applicationId }
    R->>Ctrl: accept(req, res)
    Ctrl->>BAS: accept(applicationId)
    BAS->>LS: acquire(lock:aplicacao:{id})
    LS-->>BAS: LockHandle
    BAS->>DB: BandApplicationModel.findByPk(id)
    BAS->>DB: BandApplicationModel.update(status=aceito)
    BAS->>DB: BandApplicationModel.update(status=rejeitado) [demais candidaturas]
    BAS->>CS: generateFromApplication(applicationId)
    CS->>DB: ContractModel.create({ status: aguardando_aceite })
    CS-->>BAS: Contract
    BAS->>NS: createNotification(artista, "candidatura_aceita")
    BAS->>NS: createNotification(artistas_rejeitados, "candidatura_rejeitada")
    BAS->>LS: release(lock:aplicacao:{id})
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
│  AuthService, NotificationService,       │
│  PaymentService, StripeService,          │
│  ShowService, AvaliacaoShowService,      │
│  ComentarioShowService, IngressoService, │
│  SeguidorArtistaService, ...             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Models (Sequelize ORM)         │
│  20 models mapeados para MySQL           │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  MySQL 8.0  │  Redis 7 (cache + lock)   │
└─────────────────────────────────────────┘
```
