# Quality Scenarios — Projeto Toca Aqui

Este documento descreve os principais requisitos de qualidade esperados para o sistema **Toca Aqui**, junto com cenários concretos que permitem avaliar se o sistema atende esses atributos.

---

## 1. Desempenho (Performance)

### **QS-01 — Resposta rápida em operações comuns**

- **Estímulo:** Usuário solicita a listagem de artistas ou eventos.
- **Ambiente:** Uso normal do app, conexão 4G/5G ou Wi-Fi.
- **Artefato:** API Gateway + Services.
- **Resposta esperada:** Retornar resultados em até **2 segundos**.
- **Medida:** Tempo de resposta médio ≤ **2s**.

### **QS-02 — Escalabilidade em horário de pico**

- **Estímulo:** 5x mais usuários simultâneos durante alta demanda (sexta/sábado à noite).
- **Ambiente:** Produção com carga elevada.
- **Resposta esperada:** Sistema continua operando com performance aceitável.
- **Medida:** P99 de resposta ≤ **4s**, sem quedas.

---

## 2. Disponibilidade

### **QS-03 — Disponibilidade contínua**

- **Estímulo:** Usuário tenta acessar qualquer funcionalidade.
- **Ambiente:** Horário comercial e fora de horário.
- **Resposta esperada:** Sistema disponível **99%** do tempo.
- **Medida:** SLA ≥ **99% mensal**.

### **QS-04 — Recuperação após falha de microserviço**

- **Estímulo:** Um dos serviços (ex.: Event Service) cai.
- **Ambiente:** Produção.
- **Resposta esperada:**
  - API Gateway retorna fallback apropriado.
  - Serviço se recupera automaticamente via restart do orquestrador (Docker/Kubernetes).
- **Medida:** Tempo de recuperação ≤ **30 segundos**.

---

## 3. Segurança

### **QS-05 — Acesso autorizado**

- **Estímulo:** Usuário não autenticado tenta acessar recurso protegido.
- **Resposta esperada:** Acesso negado com **401 Unauthorized**.
- **Medida:** Nenhum endpoint protegido pode responder **200** sem token válido.

### **QS-06 — Proteção contra alteração indevida**

- **Estímulo:** Usuário tenta alterar dados de outro perfil.
- **Resposta esperada:** Bloqueio imediato com **403 Forbidden**.
- **Medida:** Eventos de autorização incorreta = **0** na auditoria.

---

## 4. Manutenibilidade

### **QS-07 — Atualização sem interrupção**

- **Estímulo:** Dev envia novo deploy de um microserviço.
- **Ambiente:** Pipeline CI/CD.
- **Resposta esperada:** Rolling updates **sem downtime**.
- **Medida:** Tempo de indisponibilidade = **0s** durante deploy.

### **QS-08 — Fácil correção**

- **Estímulo:** Erro identificado em produção.
- **Resposta esperada:** Hotfix aplicado e entregue em menos de **1 dia**.
- **Medida:** Lead time para hotfix ≤ **24h**.

---

## 5. Usabilidade

### **QS-09 — Facilidade de contratação de artista**

- **Estímulo:** Dono de estabelecimento tenta contratar uma banda.
- **Ambiente:** Usuário leigo.
- **Resposta esperada:** Processo concluído em **até 3 passos**.
- **Medida:** Taxa de conversão ≥ **80%** sem erro.

### **QS-10 — Cadastro intuitivo**

- **Estímulo:** Artista cria perfil pela primeira vez.
- **Resposta esperada:** Cadastro concluído em menos de **5 minutos**.
- **Medida:** ≥ **90%** dos usuários concluem sem ajuda.

---

## 6. Confiabilidade (Robustez)

### **QS-11 — Tolerância a falhas da mensageria**

- **Estímulo:** Kafka/RabbitMQ fica instável.
- **Resposta esperada:** Serviços continuam operando; apenas recursos dependentes ficam degradados.
- **Medida:** Serviços independentes continuam funcionando **100%**.

### **QS-12 — Consistência de dados após falha**

- **Estímulo:** Interrupção durante gravação no banco.
- **Resposta esperada:** Transação é **revertida**.
- **Medida:** Registros parcialmente gravados = **0**.
