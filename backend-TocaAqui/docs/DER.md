# DER — Diagrama Entidade-Relacionamento

> Schema validado contra os models Sequelize em `src/models/` e migrations em `migrations/`.
> Banco de dados: MySQL 8.0.

## Diagrama

```mermaid
erDiagram
    USUARIOS {
        int id PK
        string nome_completo
        string email UK
        string senha_hash
        text roles "TEXT[] — array de roles (common_user, artist, establishment_owner, admin)"
        datetime created_at
        datetime updated_at
    }

    PERFIS_ARTISTAS {
        int id PK
        int usuario_id FK
        string nome_artistico
        text bio
        json generos_musicais
        decimal cache_minimo
        decimal cache_maximo
        int shows_realizados
        decimal nota_media
        string foto_perfil
        string cidade
        string estado
    }

    PERFIS_ESTABELECIMENTOS {
        int id PK
        int usuario_id FK
        int endereco_id FK
        string nome
        string tipo
        string telefone
        string descricao
        decimal latitude
        decimal longitude
    }

    ENDERECOS {
        int id PK
        string logradouro
        string numero
        string complemento
        string bairro
        string cidade
        string estado
        string cep
    }

    BANDAS {
        int id PK
        string nome
        string genero_musical
        string bio
        string foto
    }

    MEMBROS_BANDAS {
        int id PK
        int banda_id FK
        int perfil_artista_id FK
        string papel
        boolean is_lider
    }

    AGENDAMENTOS {
        int id PK
        int perfil_estabelecimento_id FK
        string titulo_evento
        text descricao_evento
        datetime data_show
        string horario_inicio
        string horario_fim
        string status "pendente | aceito | rejeitado | cancelado | realizado"
        decimal preco_ingresso_inteira
        decimal preco_ingresso_meia
        int capacidade_maxima
        int ingressos_vendidos
        string genero_musical
        boolean esta_publico
    }

    APLICACOES_BANDA_EVENTO {
        int id PK
        int evento_id FK
        int artista_id FK
        int banda_id FK
        decimal valor_proposto
        text mensagem
        string status "pendente | aceito | rejeitado | cancelado"
        datetime data_aplicacao
    }

    CONTRATOS {
        int id PK
        int aplicacao_id FK "UK"
        int evento_id FK
        int artista_id FK
        int banda_id FK
        int perfil_estabelecimento_id FK
        string status "rascunho | aguardando_aceite | aceito | cancelado | concluido"
        decimal cache_total
        string metodo_pagamento
        decimal percentual_sinal
        decimal valor_sinal
        datetime data_evento
        string horario_inicio
        string horario_fim
        boolean aceite_contratante
        boolean aceite_contratado
        int versao
        string status_pagamento "pendente | pago | falhou"
    }

    HISTORICO_CONTRATOS {
        int id PK
        int contrato_id FK
        int usuario_id FK
        string status_anterior
        string status_novo
        text observacao
        datetime created_at
    }

    PAGAMENTOS {
        int id PK
        int contrato_id FK
        decimal valor
        string metodo
        string status
        string stripe_payment_intent_id
        datetime created_at
    }

    NOTIFICACOES {
        int id PK
        int usuario_id FK
        string tipo
        text mensagem
        json dados
        boolean lida
        datetime created_at
    }

    INGRESSOS {
        int id PK
        int usuario_id FK
        int agendamento_id FK
        string tipo "inteira | meia_entrada | vip"
        decimal preco
        string status "pendente | confirmado | cancelado | utilizado"
        string codigo_qr
        string stripe_payment_intent_id
    }

    AVALIACOES_SHOWS {
        int id PK
        int usuario_id FK
        int agendamento_id FK
        int nota_artista
        int nota_local
        text comentario
        json tags_artista
        json tags_local
        datetime created_at
    }

    COMENTARIOS_SHOWS {
        int id PK
        int usuario_id FK
        int agendamento_id FK
        int parent_id FK "auto-referência para respostas"
        text conteudo
        datetime created_at
    }

    CURTIDAS_COMENTARIOS {
        int id PK
        int comentario_id FK
        int usuario_id FK
        datetime created_at
    }

    SEGUIDORES_ARTISTAS {
        int id PK
        int perfil_artista_id FK
        int usuario_id FK
        datetime created_at
    }

    FAVORITOS {
        int id PK
        int usuario_id FK
        string tipo_entidade "banda | estabelecimento | agendamento"
        int entidade_id
        datetime created_at
    }

    PREFERENCIAS_USUARIO {
        int id PK
        int usuario_id FK "UK"
        json generos_favoritos
        string cidade
        int raio_km
        json tipos_local
    }

    MEMBROS_ESTABELECIMENTO {
        int id PK
        int estabelecimento_id FK
        int usuario_id FK
        string papel "owner | admin | member"
        datetime created_at
    }

    %% Relacionamentos — Usuários
    USUARIOS ||--o{ PERFIS_ARTISTAS : "tem (1:N)"
    USUARIOS ||--o{ PERFIS_ESTABELECIMENTOS : "tem (1:N)"
    USUARIOS ||--o{ NOTIFICACOES : "recebe (1:N)"
    USUARIOS ||--o{ INGRESSOS : "compra (1:N)"
    USUARIOS ||--o{ AVALIACOES_SHOWS : "avalia (1:N)"
    USUARIOS ||--o{ COMENTARIOS_SHOWS : "comenta (1:N)"
    USUARIOS ||--o{ FAVORITOS : "favorita (1:N)"
    USUARIOS ||--o{ SEGUIDORES_ARTISTAS : "segue (1:N)"
    USUARIOS ||--o{ HISTORICO_CONTRATOS : "registra (1:N)"
    USUARIOS ||--|| PREFERENCIAS_USUARIO : "tem (1:1)"
    USUARIOS ||--o{ MEMBROS_ESTABELECIMENTO : "gerencia (1:N)"

    %% Relacionamentos — Estabelecimentos
    PERFIS_ESTABELECIMENTOS ||--o| ENDERECOS : "possui (N:1)"
    PERFIS_ESTABELECIMENTOS ||--o{ AGENDAMENTOS : "cria (1:N)"
    PERFIS_ESTABELECIMENTOS ||--o{ CONTRATOS : "assina (1:N)"
    PERFIS_ESTABELECIMENTOS ||--o{ MEMBROS_ESTABELECIMENTO : "tem membros (1:N)"

    %% Relacionamentos — Artistas e Bandas
    PERFIS_ARTISTAS ||--o{ APLICACOES_BANDA_EVENTO : "se candidata (1:N)"
    PERFIS_ARTISTAS ||--o{ CONTRATOS : "participa (1:N)"
    PERFIS_ARTISTAS ||--o{ MEMBROS_BANDAS : "integra bandas (1:N)"
    PERFIS_ARTISTAS ||--o{ SEGUIDORES_ARTISTAS : "é seguido (1:N)"
    BANDAS ||--o{ MEMBROS_BANDAS : "tem membros (1:N)"
    BANDAS ||--o{ APLICACOES_BANDA_EVENTO : "se candidata (1:N)"
    BANDAS ||--o{ CONTRATOS : "participa (1:N)"

    %% Relacionamentos — Eventos (Agendamentos)
    AGENDAMENTOS ||--o{ APLICACOES_BANDA_EVENTO : "recebe candidaturas (1:N)"
    AGENDAMENTOS ||--o| CONTRATOS : "gera contrato (1:1)"
    AGENDAMENTOS ||--o{ INGRESSOS : "vende (1:N)"
    AGENDAMENTOS ||--o{ AVALIACOES_SHOWS : "recebe avaliações (1:N)"
    AGENDAMENTOS ||--o{ COMENTARIOS_SHOWS : "recebe comentários (1:N)"

    %% Relacionamentos — Contratos
    APLICACOES_BANDA_EVENTO ||--o| CONTRATOS : "origina (1:1)"
    CONTRATOS ||--o{ PAGAMENTOS : "tem pagamentos (1:N)"
    CONTRATOS ||--o{ HISTORICO_CONTRATOS : "tem histórico (1:N)"

    %% Relacionamentos — Comentários
    COMENTARIOS_SHOWS ||--o{ COMENTARIOS_SHOWS : "tem respostas (1:N)"
    COMENTARIOS_SHOWS ||--o{ CURTIDAS_COMENTARIOS : "recebe curtidas (1:N)"
```

## Tabelas e Nomes Reais

| Model (Sequelize) | Tabela (MySQL) |
|---|---|
| UserModel | `usuarios` |
| ArtistProfileModel | `perfis_artistas` |
| EstablishmentProfileModel | `perfis_estabelecimentos` |
| AddressModel | `enderecos` |
| BandModel | `bandas` |
| BandMemberModel | `membros_bandas` |
| BookingModel | `agendamentos` |
| BandApplicationModel | `aplicacoes_banda_evento` |
| ContractModel | `contratos` |
| ContractHistoryModel | `historico_contratos` |
| PaymentModel | `pagamentos` |
| NotificationModel | `notificacoes` |
| IngressoModel | `ingressos` |
| AvaliacaoShowModel | `avaliacoes_shows` |
| ComentarioShowModel | `comentarios_shows` |
| CurtidaComentarioModel | `curtidas_comentarios` |
| SeguidorArtistaModel | `seguidores_artistas` |
| FavoriteModel | `favoritos` |
| PreferenciaUsuarioModel | `preferencias_usuario` |
| EstablishmentMemberModel | `membros_estabelecimento` |

## Fluxo Principal do Domínio

```
USUARIO (establishment_owner)
  └─► cria AGENDAMENTO (vaga aberta)
         └─► recebe N APLICACOES_BANDA_EVENTO (artistas se candidatam com valor_proposto)
                └─► estabelecimento aceita 1 candidatura
                       └─► sistema cria CONTRATO (status: aguardando_aceite)
                              └─► artista confirma (status: aceito)
                                     └─► show acontece → status: concluido
                                            └─► usuários criam AVALIACOES_SHOWS
```
