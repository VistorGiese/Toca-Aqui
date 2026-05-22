# Runbook de Incidentes — Toca Aqui

Este runbook descreve os procedimentos de diagnóstico e recuperação para os cenários de falha mais prováveis no ambiente Docker Compose.

---

## Comandos de diagnóstico rápido

```bash
# Status de todos os containers
docker compose ps

# Logs em tempo real do backend
docker compose logs -f app

# Logs do Nginx
docker compose logs -f nginx

# Logs do MySQL
docker compose logs -f mysql

# Logs do Redis
docker compose logs -f redis

# Uso de recursos dos containers
docker stats
```

---

## INC-001: API retornando 502 Bad Gateway

**Sintoma:** App mobile recebe erro 502; Nginx está de pé mas sem backend.

**Diagnóstico:**
```bash
docker compose ps          # verificar se container 'app' está running
docker compose logs app    # verificar erro de startup
```

**Causas comuns:**
- Container `app` crashou e está reiniciando.
- Falha de conexão com MySQL na inicialização (sequelize.authenticate()).
- Variável de ambiente faltando no `.env`.

**Resolução:**
```bash
docker compose restart app
# ou, se falha de build:
docker compose up -d --build app
```

---

## INC-002: API lenta (latência acima dos SLOs)

**Sintoma:** Requisições demorando > 350 ms (p95).

**Diagnóstico:**
```bash
docker stats                  # verificar CPU/RAM dos containers
docker compose logs app       # erros de timeout ou query lenta
```

**No MySQL — verificar slow queries:**
```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW PROCESSLIST;
```

**Causas comuns:**
- Query complexa sem índice.
- Pool de conexões MySQL esgotado.
- Container com CPU throttling (limite de recurso).

**Resolução:**
- Identificar query lenta via `SHOW PROCESSLIST` e otimizar.
- Reiniciar container `app` se pool estiver com conexões presas.

---

## INC-003: Redis indisponível

**Sintoma:** Rate limiting não funciona; notificações Pub/Sub param de ser entregues.

**Diagnóstico:**
```bash
docker compose ps redis
docker compose logs redis
redis-cli -h localhost -p 6379 ping  # deve retornar PONG
```

**Resolução:**
```bash
docker compose restart redis
```

**Impacto durante indisponibilidade:**
- Rate limiter falha aberta (requisições passam sem limite).
- Notificações não são entregues em tempo real.
- Dados do Redis são recuperados do AOF (appendonly) ao reiniciar.

---

## INC-004: MySQL indisponível

**Sintoma:** API retorna 500 em todas as operações que acessam banco.

**Diagnóstico:**
```bash
docker compose ps mysql
docker compose logs mysql
docker compose exec mysql mysqladmin ping -h localhost
```

**Resolução:**
```bash
docker compose restart mysql
# aguardar health check passar antes de reiniciar app
docker compose restart app
```

**Atenção:** O volume `mysql_data` preserva todos os dados. Nunca remover o volume sem backup.

---

## INC-005: E-mails não sendo enviados

**Sintoma:** Usuários não recebem e-mails de notificação.

**Diagnóstico:**
```bash
docker compose logs app | grep -i smtp
docker compose logs app | grep -i email
```

**Causas comuns:**
- Credenciais Gmail inválidas ou expiradas (`SMTP_USER`, `SMTP_PASS`).
- Limite diário de envio do Gmail atingido (~500 e-mails/dia).
- Variáveis de ambiente não carregadas no container.

**Resolução:**
- Verificar e renovar App Password do Gmail se necessário.
- Recriar o container: `docker compose up -d --force-recreate app`.

---

## INC-006: Falha nos testes do CI

**Sintoma:** Pipeline do GitHub Actions falha no job `test`.

**Diagnóstico:**
- Verificar log do GitHub Actions na aba Actions do repositório.
- Reproduzir localmente: `cd backend-TocaAqui && npm test`.

**Causas comuns:**
- Teste quebrando por mudança em service/controller sem atualização do mock.
- Dependência nova não instalada (falta de `npm install`).
- Variável de ambiente necessária nos testes não configurada no CI.

**Resolução:**
- Corrigir o teste ou o código conforme a falha indicada.
- Nunca fazer merge sem pipeline verde.

---

## Checklist de verificação pós-deploy

- [ ] `docker compose ps` — todos os containers `Up`
- [ ] `docker compose logs app` — sem erros de startup
- [ ] `GET /usuarios/perfil` com token válido retorna 200
- [ ] `GET /agendamentos` retorna lista (mesmo vazia)
- [ ] Redis respondendo: `redis-cli ping` retorna `PONG`
- [ ] MySQL respondendo: health check passing
