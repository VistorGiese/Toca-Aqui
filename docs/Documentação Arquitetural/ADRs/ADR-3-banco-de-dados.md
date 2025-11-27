# ADR 003 — Banco de Dados: MySQL como Banco Relacional Principal

**Status:** Aceito  
**Data:** 14/07/2025

---

## Contexto

O sistema precisa lidar com entidades fortemente relacionadas — usuários, endereços, eventos, estabelecimentos, bandas e aplicações.  
A modelagem é essencialmente **relacional** e exige:

- Integridade referencial
- Joins performáticos
- Transações ACID
- Consultas estruturadas para relatórios

Além disso, o time já possuía familiaridade com bancos de dados SQL, reduzindo curva de aprendizado e riscos.

---

## Decisão

Foi adotado **MySQL** como banco de dados principal para:

- O **backend monolítico** (domínio core)
- Um **MySQL separado** para o microsserviço social

---

## Motivação

- O modelo relacional se ajusta perfeitamente ao domínio e à necessidade de consistência.
- MySQL é amplamente suportado, estável e confiável.
- Alta performance para leitura e escrita estruturada.
- Integração simples com ORMs como **Sequelize**, facilitando desenvolvimento.

---

## Consequências

### Positivas

- Consistência e confiabilidade dos dados.
- Facilidade na execução de consultas complexas.
- Integração simplificada com Docker, Sequelize e o ecossistema Node.js.

### Negativas

- Escalabilidade vertical limitada quando comparado a bancos NoSQL.
- Necessidade de replicação manual para alta disponibilidade.
- Manter dois bancos exige coordenação extra entre os serviços.
