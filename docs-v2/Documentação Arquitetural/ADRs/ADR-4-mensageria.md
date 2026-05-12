# ADR 004 — Mensageria e Notificações em Tempo Real: Redis Pub/Sub

**Status:** Aceito
**Data:** 12/05/2026

---

## Contexto

O sistema Toca Aqui precisa notificar usuários em tempo real sobre eventos relevantes: candidatura recebida, contrato gerado, candidatura aceita ou recusada, show cancelado, avaliação recebida, entre outros. Essa comunicação assíncrona não pode bloquear o fluxo HTTP principal da API.

Na fase de planejamento considerou-se o uso de Kafka ou RabbitMQ como broker de mensagens. No entanto, dado o contexto de TCC com equipe reduzida e infraestrutura local, a adição de um broker dedicado aumentaria a complexidade operacional sem benefício proporcional no estágio atual.

---

## Decisão

Usar **Redis Pub/Sub** como mecanismo de mensageria interna, implementado via `PubSubService`.

O Redis já faz parte do stack (também usado para rate limiting), eliminando a necessidade de um container adicional.

### Como funciona

1. Um `Service` publica uma mensagem em um canal Redis ao completar uma operação de negócio.
2. O `PubSubService` consome a mensagem e aciona o `NotificationService`.
3. O `NotificationService` persiste a notificação no banco (`NotificationModel`) e a entrega ao usuário.

### Casos de uso de notificações

| Evento | Canal |
|---|---|
| Nova candidatura recebida | `candidatura:nova` |
| Candidatura aceita | `candidatura:aceita` |
| Candidatura recusada | `candidatura:recusada` |
| Contrato gerado | `contrato:gerado` |
| Show cancelado | `show:cancelado` |

---

## Motivação

- Redis já está no stack para rate limiting, sem custo adicional de infraestrutura.
- Pub/Sub do Redis é suficiente para o volume esperado no MVP.
- Evita a complexidade operacional de Kafka (ZooKeeper, tópicos, consumer groups) ou RabbitMQ (exchanges, bindings, DLQ).
- `PubSubService` desacopla o disparo de notificações da lógica de negócio.

---

## Consequências

### Positivas

- Infraestrutura simples: Redis já disponível no Docker Compose.
- Baixa latência de entrega das notificações.
- Código de disparo desacoplado via serviço dedicado.

### Negativas

- Redis Pub/Sub não possui persistência de mensagens: se o subscriber estiver offline no momento da publicação, a mensagem é perdida.
- Sem suporte nativo a dead letter queue, retry ou ordering garantido.
- Não adequado para volume muito alto de eventos sem Redis Streams ou broker dedicado.

### Evolução planejada

Para versões futuras com maior volume de usuários, a migração para Redis Streams ou RabbitMQ pode ser feita substituindo apenas o `PubSubService`, sem impacto nos demais módulos.
