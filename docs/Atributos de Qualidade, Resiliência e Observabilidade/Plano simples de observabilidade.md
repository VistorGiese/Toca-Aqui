# Plano Simples de Observabilidade

Este plano define métricas essenciais para monitorar a saúde, estabilidade e performance do sistema.

---

## 1. Latência (Tempo de Resposta)

- **95%** das requisições: abaixo de **300 ms** (ideal para APIs REST)
- **99%** das requisições: abaixo de **800 ms**
- **Tempo médio (avg):** ideal entre **150–250 ms**

---

## 2. Taxa de Erros

- **Erro total:** < **1%** por minuto (saudável)
- **Erros críticos (5xx):** < **0.1%** (excelente)
- **Erros de validação (4xx):** até **2%** aceitável

---

## 3. Disponibilidade

- **API padrão:** **99.9%** (3 nines)

---

## 4. Saúde do Banco de Dados

- **Uso de CPU:** < **70%** em horários de pico
- **Uso de RAM:** < **80%** em média
- **Queries lentas:** < **2%** do total

---

## 5. Throughput (RPS – Requisições por Segundo)

- **APIs comuns:** 100–300 RPS estáveis sem perda de performance
- **Projetos médios:** até **1.000 RPS** com cache + DB otimizado
- **Erros por sobrecarga:** < **0.5%**

---

## 6. Logs

- **Logs de erro:** < **5%** do total (saudável)
- **Logs com stacktrace:** < **1%** (indica poucas falhas inesperadas)

---

## 7. Métricas de Infraestrutura

- **Disco livre:** > **20%** sempre
- **Latência interna de rede:** < **10 ms**
- **Reinícios de container:** < **3 por dia** (acima disso indica instabilidade)

---
