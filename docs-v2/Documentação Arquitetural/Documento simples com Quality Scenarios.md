# Quality Scenarios — Toca Aqui

Este documento descreve os cenários de qualidade (quality scenarios) do sistema, cobrindo os atributos mais relevantes para o contexto da plataforma.

---

## 1. Performance

**Cenário:** Um artista abre o feed de vagas disponíveis no horário de pico (sexta à noite).

| Elemento | Descrição |
|---|---|
| Estímulo | Requisição GET `/agendamentos` com filtros |
| Fonte | App mobile via Nginx |
| Ambiente | Carga normal, ~50 usuários simultâneos |
| Resposta | API retorna lista paginada com dados de vagas |
| Medida | 90% das requisições respondidas em ≤ 250 ms |

---

## 2. Disponibilidade

**Cenário:** O container `app` sofre reinício inesperado por falha de memória.

| Elemento | Descrição |
|---|---|
| Estímulo | Container reiniciado pelo Docker (`restart: unless-stopped`) |
| Fonte | Falha interna da aplicação |
| Ambiente | Produção |
| Resposta | Container reinicia automaticamente; Nginx responde 502 durante o intervalo |
| Medida | Recuperação em ≤ 9 segundos; disponibilidade mensal ≥ 99,2% |

---

## 3. Segurança — Autenticação

**Cenário:** Um usuário tenta acessar endpoint protegido sem token JWT válido.

| Elemento | Descrição |
|---|---|
| Estímulo | Requisição HTTP sem header `Authorization` ou com token expirado |
| Fonte | Cliente externo (app ou agente malicioso) |
| Ambiente | Qualquer |
| Resposta | Middleware `authMiddleware` rejeita com HTTP 401 antes de atingir o controller |
| Medida | 100% das rotas protegidas rejeitam requisições inválidas |

---

## 4. Segurança — Rate Limiting

**Cenário:** Um agente tenta fazer força bruta na rota de login.

| Elemento | Descrição |
|---|---|
| Estímulo | Múltiplas requisições POST `/usuarios/login` em curto intervalo |
| Fonte | Cliente externo |
| Ambiente | Qualquer |
| Resposta | Middleware `rateLimiter` bloqueia após limite configurado, retorna HTTP 429 |
| Medida | Bloqueio aplicado via Redis; sem impacto nas demais rotas |

---

## 5. Manutenibilidade

**Cenário:** Um novo desenvolvedor precisa adicionar um novo endpoint de domínio.

| Elemento | Descrição |
|---|---|
| Estímulo | Requisito de nova funcionalidade |
| Fonte | Time de desenvolvimento |
| Ambiente | Desenvolvimento |
| Resposta | Seguir padrão: schema Zod → controller → service → model → rota |
| Medida | Novo endpoint completo implementável sem alterar módulos de outros domínios |

---

## 6. Confiabilidade — Integridade de Contratos

**Cenário:** Estabelecimento aceita candidatura de artista; contrato deve ser gerado automaticamente.

| Elemento | Descrição |
|---|---|
| Estímulo | PUT `/eventos/:id/aceitar` chamado pelo estabelecimento |
| Fonte | App mobile (perfil estabelecimento) |
| Ambiente | Fluxo normal de negócio |
| Resposta | `BandApplicationService.accept()` aceita candidatura e aciona `ContractService.generateFromApplication()` |
| Medida | Contrato sempre gerado ou erro explícito retornado; sem aceitação silenciosa sem contrato |

---

## 7. Escalabilidade (planejado)

**Cenário:** Volume de usuários cresce para 10x do esperado no MVP.

| Elemento | Descrição |
|---|---|
| Estímulo | Aumento de carga |
| Fonte | Crescimento orgânico da plataforma |
| Ambiente | Pós-MVP |
| Resposta | Horizontal scaling do container `app`; Redis e MySQL em instâncias dedicadas |
| Medida | Latência mantida dentro dos SLOs com múltiplas réplicas do `app` |
