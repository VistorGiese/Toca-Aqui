# ADR 005 — Estratégia de Deploy: Docker + Nginx Gateway

**Status:** Aceito  
**Data:** 05/11/2025

---

## Contexto

A plataforma utiliza:

- Monolito principal em Node.js
- Microsserviço social também em Node.js
- MySQL (2 bancos independentes)
- Redis
- Gateway para gerenciamento de rotas

As necessidades principais eram:

- Padronizar ambiente
- Simplificar manutenção
- Garantir portabilidade
- Facilitar desenvolvimento local e testes da plataforma completa

---

## Decisão

A estratégia adotada foi:

- **Docker** para todos os serviços
- **Docker Compose** para orquestração local
- **Nginx** como **API Gateway** para unificação e roteamento de endpoints

---

## Motivação

- Facilita isomorfismo entre ambiente local, staging e produção.
- Permite subir toda a plataforma com um único comando.
- Nginx oferece versionamento, rotas limpas, controle de tráfego e futura escalabilidade.
- Base sólida para evolução futura para clusters (Swarm/Kubernetes).

---

## Consequências

### Positivas

- Deploy totalmente padronizado.
- Ambientes replicáveis e reprodutíveis.
- Redução de erros de configuração e incompatibilidades.
- Estrutura pronta para clusterização e escalabilidade futura.

### Negativas

- Requer conhecimento prévio de Docker.
- Pequeno overhead de execução comparado ao bare metal.
- Configuração de Nginx pode ser complexa para iniciantes.
