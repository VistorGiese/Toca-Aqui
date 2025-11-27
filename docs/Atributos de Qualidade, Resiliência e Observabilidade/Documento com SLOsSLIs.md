# SLOs e SLIs – Valores Reais do Sistema

Este documento define os principais **SLIs (Service Level Indicators)** e **SLOs (Service Level Objectives)** do sistema, garantindo padrões claros de performance, disponibilidade e confiabilidade.

---

## 1. Tempo de Resposta da API

- **90%** das requisições: ≤ **250 ms**
- **95%** das requisições: ≤ **350 ms**
- **99%** das requisições: ≤ **600 ms**

---

## 2. Disponibilidade do Sistema

- **Disponibilidade mínima recomendada:** 99,2%
- **Disponibilidade ideal para estabilidade:** 99,6%

---

## 3. Taxa de Erros

- **Erros 5xx permitidos:** ≤ **0,8%**
- **Erros 4xx aceitáveis:** ≤ **2,5%**
- **Total combinado de erros esperado:** ≤ **3,3%**

---

## 4. Performance do Banco de Dados (MySQL)

- **Queries simples:** ≤ **18 ms**
- **Queries complexas:** ≤ **120 ms**
- **Falhas de conexão:** ≤ **0,2%**

---

## 5. Uso de Recursos do Sistema

- **CPU média dos containers:** ≤ **68%**
- **RAM média:** ≤ **75%**
- **Latência API → Banco:** ≤ **45 ms**

---

## 6. Resiliência e Recuperação

- **Tempo máximo para API voltar após reinício:** ≤ **9 segundos**
- **Tempo máximo para reconectar ao banco após falha:** ≤ **1,8 segundos**

---

## 7. Observabilidade

- **Cobertura de logs nos endpoints:** 100%
- **Retenção de logs de erro:** 30 dias
- **Alertas emitidos quando:** CPU > 80% por mais de 1 minuto

---
