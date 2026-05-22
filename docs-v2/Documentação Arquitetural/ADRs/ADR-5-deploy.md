# ADR 005 — Estratégia de Deploy: Docker Compose + GitHub Actions

**Status:** Aceito (em evolução)
**Data:** 12/05/2026

---

## Contexto

O Toca Aqui precisa de um ambiente de execução reproduzível e de um pipeline de integração contínua para garantir qualidade do código antes de merges na branch principal. O projeto está no estágio de TCC, com execução local como ambiente primário e sem ambiente de produção definido ainda.

---

## Decisão

### Ambiente de execução: Docker Compose

O backend roda com **4 serviços** orquestrados via Docker Compose:

| Serviço | Imagem | Função |
|---|---|---|
| `app` | Build local (Dockerfile) | API Node.js + Express |
| `mysql` | mysql:8.0 | Banco de dados relacional |
| `redis` | redis:7-alpine | Pub/Sub + Rate limiting |
| `nginx` | nginx:1.25-alpine | Reverse proxy / entry point |

Configuração via arquivo `.env` (nunca versionado). O `app` aguarda health checks de `mysql` e `redis` antes de subir (`depends_on` com `condition: service_healthy`).

### CI/CD: GitHub Actions

Pipeline definido em `.github/workflows/main.yml`, acionado em push para `main` e `dev`, e em pull requests.

**Jobs atuais:**

```
build → test
```

| Job | Ação |
|---|---|
| `build` | `npm install` no diretório `backend-TocaAqui` |
| `test` | `npm test` no diretório `backend-TocaAqui` |

**Deploy:** não automatizado ainda. Planejado para versão futura.

---

## Motivação

- Docker Compose elimina inconsistências de ambiente entre máquinas.
- Um único `docker compose up` sobe toda a infraestrutura necessária.
- GitHub Actions fornece CI gratuito integrado ao repositório, sem dependências externas.
- Testes automatizados no pipeline impedem merge de código com falhas.

---

## Consequências

### Positivas

- Ambiente 100% reproduzível via Docker.
- Feedback rápido de CI em pull requests.
- Configuração de infraestrutura versionada junto ao código.

### Negativas

- Sem ambiente de staging ou produção configurado.
- Deploy ainda é processo manual.
- Pipeline sem step de deploy automatizado reduz benefício do CD.

### Evolução planejada

- Adicionar step de deploy para servidor de staging (ex.: VPS, Railway ou Render).
- Adicionar `npm audit` no pipeline para análise de vulnerabilidades.
- Habilitar branch protection rules exigindo pipeline verde antes de merge em `main`.
