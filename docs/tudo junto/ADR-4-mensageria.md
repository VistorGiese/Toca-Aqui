# ADR 004 — Mensageria e Cache: Redis

**Status:** Aceito  
**Data:** 05/11/2025

---

## Contexto

O sistema precisava de soluções para:

- Cache para melhorar o desempenho de listagens e consultas frequentes.
- Armazenamento temporário para tokens de login, sessões ou mecanismos de rate limit.
- Possibilidade futura de **pub/sub** para notificações internas entre módulos.

Nesse cenário, o **Redis** é amplamente utilizado em stacks Node.js por sua velocidade e simplicidade.

---

## Decisão

Foi adotado **Redis** para:

- Cache de consultas
- Controle de sessão e tokens
- Suporte a **pub/sub** entre módulos

---

## Motivação

- Redis possui latência extremamente baixa.
- Reduz carga no banco de dados principal.
- Possibilita uso futuro para filas, workers e pub/sub.
- Integra-se facilmente ao ecossistema Node.js.

---

## Consequências

### Positivas

- Redução significativa no tempo de resposta em listagens de bandas, eventos e outras consultas.
- Possibilidade de aplicar rate-limiting com eficiência.
- Menor número de consultas repetidas ao MySQL.

### Negativas

- Necessidade de definir políticas adequadas de invalidação de cache.
- Risco de inconsistências se o cache não for atualizado corretamente.
