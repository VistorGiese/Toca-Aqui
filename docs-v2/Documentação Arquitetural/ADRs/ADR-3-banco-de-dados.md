# ADR 003 — Banco de Dados: MySQL 8.0 com Sequelize

**Status:** Aceito
**Data:** 05/11/2025

---

## Contexto

O sistema Toca Aqui possui dados fortemente relacionados: usuários possuem perfis de artista ou estabelecimento; estabelecimentos publicam eventos; artistas e bandas se candidatam a eventos; candidaturas geram contratos; contratos possuem histórico e pagamentos. Esse modelo relacional denso exige um banco com suporte robusto a integridade referencial e transações.

---

## Decisão

Usar **MySQL 8.0** como banco de dados principal, acessado via ORM **Sequelize** com TypeScript.

A instância roda como container Docker com volume persistente e script de inicialização (`database/init.sql`).

### Justificativas técnicas

- Banco relacional adequado ao modelo de domínio com múltiplas foreign keys e cascades.
- MySQL 8.0 oferece suporte a window functions, CTEs e JSON nativo.
- Sequelize possui suporte nativo a TypeScript, associações declarativas e migrations.
- Amplamente suportado e documentado no ecossistema Node.js.
- Execução via Docker Compose garante ambiente padronizado entre desenvolvedores.

---

## Motivação para Docker

- Elimina inconsistências de versão entre máquinas.
- Ambiente sobe com um único comando (`docker compose up`).
- Volume nomeado (`mysql_data`) garante persistência entre reinícios.
- Health check configurado garante que o backend só sobe após o banco estar pronto.

---

## Consequências

### Positivas

- Integridade referencial garantida por constraints de banco.
- Ambiente de desenvolvimento reproduzível.
- Transações ACID sem necessidade de lógica compensatória na aplicação.
- ORM reduz SQL boilerplate e facilita manutenção.

### Negativas

- Escalabilidade horizontal do banco exige configuração adicional (replicação, sharding) não planejada para o MVP.
- Leve curva de aprendizado para quem não está habituado a Docker.
- Sequelize pode introduzir overhead de queries em cenários de alta performance.
