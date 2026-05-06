# Event Scheduling Context — Entities, Value Objects e Aggregates

O **Event Scheduling Context** envolve tudo relacionado à criação de eventos e candidaturas de bandas na plataforma.

---

## 1. Aggregate Root: **Evento (Event)**

### **Entity: Evento**

Representa um show ou apresentação publicada por um estabelecimento.

### **Atributos (Entity)**

- `id` (UUID ou inteiro)
- `titulo_evento`
- `descricao_evento`
- `data_show`
- `horario_inicio`
- `horario_fim`
- `status_evento` (ex.: aberto, fechado, concluído)
- `perfil_estabelecimento_id` (FK)
- `created_at`
- `updated_at`

---

## **Value Objects do Evento**

Value Objects são imutáveis e só existem dentro da entidade Evento.

### **1. HorarioRange**

Representa o intervalo de horário do evento.

- `inicio`: exemplo → `20:00`
- `fim`: exemplo → `23:30`

Regra:

- `inicio` **deve ser antes** de `fim`.

---

### **2. DataShow**

Representa a data do show.

- `data`: exemplo → `2025-12-15`

Regras:

- Não pode ser criação de evento com data no passado.

---

### **3. TituloEvento**

Valida:

- tamanho mínimo/máximo
- ausência de caracteres inválidos
- sanitização básica

---

### **4. DescricaoEvento**

Valida:

- limite de tamanho
- sanitização de HTML/texto
- proteção contra XSS

---

## 2. Entity: **Aplicação de Banda (BandApplication)**

Esta entidade faz parte do aggregate do Evento (não é raiz).

### **Atributos**

- `id`
- `banda_id` (FK)
- `evento_id` (FK)
- `status` (pendente / aceito / rejeitado)
- `data_aplicacao`

### **Por que não é um Aggregate Root?**

- Só existe **dentro do ciclo de vida do Evento**.
- Se o evento for deletado, todas as candidaturas também devem ser removidas.
- O Evento controla totalmente sua consistência.

---

## **Value Objects da Aplicação de Banda**

### **1. StatusAplicacao**

Domínio limitado:

- `"pendente"`
- `"aceito"`
- `"rejeitado"`

Regras:

- Não pode assumir valores fora do domínio.
- Mudanças devem passar pelo Evento (aggregate root).

---

### **2. DataAplicacao**

Valida:

- formato correto
- não permite datas futuras

---

---

## 3. Aggregate Structure

### **Aggregate Root**

**Evento**

### **Entities internas**

**AplicacaoBanda**

### **Value Objects**

- `DataShow`
- `HorarioRange`
- `StatusEvento` (opcional, se o estado do evento for um VO)
- `StatusAplicacao`
- `DataAplicacao`

---

## Regras de Consistência Interna (Invariants)

O Aggregate deve garantir:

1. **Uma banda não pode aplicar duas vezes para o mesmo evento.**
2. **O estabelecimento só pode aceitar bandas que realmente aplicaram.**
3. **Após a data do show, o evento não pode mais aceitar candidaturas.**
4. **O horário de início deve ser anterior ao horário de término.**
5. **A data do show não pode ser no passado ao criar o evento.**
6. **Eventos finalizados não podem sofrer alterações.**

---
