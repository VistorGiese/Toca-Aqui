# SLOs e SLIs — Toca Aqui

Este documento define os principais **SLIs (Service Level Indicators)** e **SLOs (Service Level Objectives)** do sistema. Os valores são baseados em benchmarks de sistemas similares (APIs Node.js + MySQL em containers Docker) e representam metas a serem atingidas e monitoradas em ambiente de produção.

> **Nota:** O sistema está atualmente em ambiente de desenvolvimento local. As métricas abaixo são objetivos definidos para orientar o design e futura implantação de observabilidade.

---

## 1. Latência da API (SLI: tempo de resposta por percentil)

| Percentil | SLO |
|---|---|
| p50 (mediana) | ≤ 120 ms |
| p90 | ≤ 250 ms |
| p95 | ≤ 350 ms |
| p99 | ≤ 600 ms |

**Endpoints críticos** (match artista ↔ estabelecimento):
- `GET /agendamentos` — listagem de vagas
- `PUT /eventos/:id/aceitar` — aceite de candidatura + geração de contrato
- `POST /usuarios/login` — autenticação

---

## 2. Disponibilidade (SLI: uptime mensal)

| Nível | SLO |
|---|---|
| Mínimo aceitável | 99,2% (~5,8h de downtime/mês) |
| Objetivo ideal | 99,6% (~2,9h de downtime/mês) |

O Nginx absorve requisições enquanto o container `app` reinicia (`restart: unless-stopped`). Requisições durante reinício recebem HTTP 502 por até 9 segundos.

---

## 3. Taxa de Erros (SLI: proporção de respostas de erro)

| Tipo de erro | SLO |
|---|---|
| Erros 5xx (falhas do servidor) | ≤ 0,8% das requisições |
| Erros 4xx (erros do cliente) | ≤ 2,5% das requisições |
| Total combinado | ≤ 3,3% das requisições |

---

## 4. Performance do MySQL (SLI: tempo de query)

| Tipo de query | SLO |
|---|---|
| Queries simples (por PK/FK) | ≤ 18 ms |
| Queries complexas (joins, agregações) | ≤ 120 ms |
| Falhas de conexão | ≤ 0,2% |

O health check do container MySQL (`mysqladmin ping`) garante que o backend só conecta após o banco estar responsivo.

---

## 5. Uso de Recursos dos Containers (SLI: utilização de CPU/RAM)

| Recurso | SLO |
|---|---|
| CPU média do container `app` | ≤ 68% |
| RAM média do container `app` | ≤ 75% |
| Latência API → MySQL (rede interna Docker) | ≤ 45 ms |

---

## 6. Resiliência e Recuperação (SLI: tempo de recuperação)

| Evento | SLO |
|---|---|
| Tempo para API voltar após reinício do container | ≤ 9 segundos |
| Tempo para reconectar ao MySQL após falha do banco | ≤ 1,8 segundos |
| Tempo para reconectar ao Redis após falha | ≤ 2 segundos |

---

## 7. Rate Limiting (SLI: proteção de endpoints)

| Métrica | SLO |
|---|---|
| Bloqueio de excesso de requisições por IP | 100% aplicado via Redis |
| Falso positivo (bloqueio de usuário legítimo) | ≤ 0,1% |

---

## 8. E-mail Transacional (SLI: entrega de e-mail)

| Métrica | SLO |
|---|---|
| Taxa de entrega de e-mails via Gmail SMTP | ≥ 98% |
| Tempo de enfileiramento até envio | ≤ 5 segundos |
