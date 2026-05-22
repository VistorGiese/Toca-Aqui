# Estratégia de Deploy — Toca Aqui

**Atualizado em:** 12/05/2026

---

## Visão Geral

O Toca Aqui adota uma estratégia de entrega contínua em estágio inicial, com integração contínua (CI) funcional e deploy manual no ambiente local. A evolução para deploy automatizado em servidor remoto está planejada para versão pós-MVP.

---

## Ambientes

| Ambiente | Status | Descrição |
|---|---|---|
| **Local (desenvolvimento)** | Ativo | Docker Compose com 4 containers |
| **Staging** | Planejado | Servidor remoto com deploy automatizado |
| **Produção** | Planejado | Pós-validação do MVP |

---

## Infraestrutura Local (Docker Compose)

O ambiente de desenvolvimento e demonstração roda via **Docker Compose** com os seguintes containers:

| Container | Imagem | Porta exposta |
|---|---|---|
| `nginx` | nginx:1.25-alpine | 80 |
| `app` | build local | 3000 (interno) |
| `mysql` | mysql:8.0 | 3307 (host) |
| `redis` | redis:7-alpine | 6379 (host) |

**Inicialização:**

```bash
cp .env.example .env   # configurar variáveis
docker compose up -d   # subir todos os containers
```

O `app` aguarda health checks de `mysql` e `redis` antes de iniciar.

---

## Pipeline de CI/CD (GitHub Actions)

**Arquivo:** `.github/workflows/main.yml`

**Gatilhos:**
- Push para `main` ou `dev`
- Pull Requests (qualquer branch)

**Jobs:**

```
build ──► test
```

| Job | Passos | Diretório |
|---|---|---|
| `build` | `npm install` | `./backend-TocaAqui` |
| `test` | `npm test` | `./backend-TocaAqui` |

O job `test` depende do `build` (executa em sequência). Falha nos testes bloqueia o merge via branch protection.

---

## Branching Strategy

| Branch | Finalidade |
|---|---|
| `main` | Código estável; base para releases |
| `dev` | Integração de features em desenvolvimento |
| `feature/*` | Features individuais; PR → dev |
| `fix/*` | Correções; PR → dev ou main |

---

## Processo de Deploy (atual — manual)

1. Merge para `main` após pipeline verde.
2. Acesso ao servidor (SSH).
3. `git pull origin main`
4. `docker compose down && docker compose up -d --build`
5. Verificar logs: `docker compose logs -f app`

---

## Evolução Planejada

| Item | Descrição |
|---|---|
| Step de deploy no pipeline | Automatizar `docker compose up` via SSH no step `deploy` do GitHub Actions após `test` |
| Environment secrets | `DEPLOY_SSH_KEY`, `DEPLOY_HOST` nos GitHub Secrets |
| Rollback | Tag de imagem Docker por commit SHA; `docker compose up` da versão anterior |
| Branch protection | Exigir pipeline verde antes de merge em `main` |
| `npm audit` no CI | Detectar vulnerabilidades de dependências automaticamente |
