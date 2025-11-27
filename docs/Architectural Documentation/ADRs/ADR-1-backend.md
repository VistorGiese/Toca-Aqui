# ADR 001 — Arquitetura Backend: Monolito + Microsserviço Social

**Status:** Aceito  
**Data:** 05/11/2025

---

## Contexto

O projeto **Toca Aqui** é um aplicativo mobile que conecta artistas a estabelecimentos. O backend precisava lidar com operações centrais — como cadastro de usuários, estabelecimentos, bandas, eventos e aplicações a shows — enquanto também oferece funcionalidades que exigem escalabilidade diferente, como comentários, favoritos e avaliações.

Durante o desenvolvimento, foi identificado que:

- O domínio principal tem forte acoplamento (usuários → perfis → eventos → bandas).
- O domínio social (comentários, avaliações e favoritos) possui alto volume de leitura e escrita, fluxo independente e necessidade de escalabilidade horizontal.
- Um backend totalmente de microsserviços seria custoso demais para a equipe no contexto atual.
- O time precisava entregar rapidamente um MVP funcional.

---

## Decisão

A arquitetura adotada será composta por:

### Backend Principal — Monolito

Contendo:

- Usuários (autenticação/autorização)
- Perfis de estabelecimento e artistas
- Bandas
- Endereços
- Eventos e aplicações

### Microsserviço Social — Independente

Contendo:

- Comentários
- Favoritos
- Avaliações

### Comunicação

A comunicação entre os serviços ocorrerá via **HTTP REST** utilizando **Nginx Gateway**.

---

## Motivação

- O monolito reduz a complexidade inicial, facilita manutenção e acelera entregas do core business.
- O microsserviço social permite escalabilidade isolada, já que é a parte com maior volume de interações dos usuários.
- Isolamento de falhas: o serviço social pode instabilizar sem derrubar o sistema principal.
- Permite evolução futura para mais microsserviços sem necessidade de reescrever o core.

---

## Consequências

### Positivas

- Menor complexidade inicial.
- Deploy e CI/CD simplificados.
- Serviço social escalável independentemente.
- Possibilidade de evoluir para microsserviços no futuro.

### Negativas

- Dependência de integridade entre dois bancos de dados distintos.
- Latência de rede no acesso ao microsserviço social.
- Necessidade de gateway e monitoramento extra.
