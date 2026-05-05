# ADR 002 — Framework Frontend Mobile: React Native com Expo

**Status:** Aceito  
**Data:** 14/07/2025

---

## Contexto

O app **Toca Aqui** precisava ser disponibilizado para **Android e iOS**. A equipe possuía experiência prévia com **React**, **TypeScript** e desenvolvimento frontend web. Era necessário um framework que fosse:

- Multiplataforma
- De rápido desenvolvimento
- Com suporte ativo e ecossistema maduro
- Capaz de facilitar a construção de interfaces móveis modernas

---

## Decisão

O framework escolhido para o desenvolvimento do aplicativo mobile foi **React Native com Expo Go**.

---

## Motivação

- Expo facilita desenvolvimento, testes, deploy e publicação.
- React Native é multiplataforma, reduzindo custo e tempo de desenvolvimento.
- A equipe já domina React e TypeScript.
- Ecossistema forte, com documentação extensa e bibliotecas maduras.
- Hot Reload permite desenvolvimento mais rápido e iterativo.

---

## Consequências

### Positivas

- Entrega acelerada do aplicativo.
- Menor curva de aprendizado para a equipe.
- Ecossistema sólido com UI kits, libs, ferramentas e roteamento.

### Negativas

- Expo limita o acesso a algumas APIs nativas avançadas.
- Performance inferior ao desenvolvimento nativo em cenários gráficos intensos.
- Dependência do ecossistema do Expo para builds e algumas integrações.
