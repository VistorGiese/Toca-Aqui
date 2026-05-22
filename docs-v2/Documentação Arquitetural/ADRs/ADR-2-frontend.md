# ADR 002 — Framework Frontend Mobile: React Native com Expo

**Status:** Aceito
**Data:** 14/07/2025

---

## Contexto

O app **Toca Aqui** precisava ser disponibilizado para Android e iOS com uma única base de código. A equipe possui experiência prévia com React e TypeScript. O prazo de entrega do TCC exigia um framework de desenvolvimento rápido com ecossistema maduro.

---

## Decisão

Usar **React Native com Expo** como framework mobile, com **TypeScript** como linguagem.

### Bibliotecas principais

| Responsabilidade | Biblioteca |
|---|---|
| Navegação | React Navigation (Stack + Bottom Tabs) |
| Estado de autenticação | React Context API + AsyncStorage |
| Requisições HTTP | Axios (via camada `http/`) |
| Armazenamento local | AsyncStorage |

### Estrutura de navegadores

O app possui três navegadores raiz, determinados pelo tipo de perfil do usuário autenticado:

| Navigator | Perfil | Tabs principais |
|---|---|---|
| `UserNavigator` | Usuário comum | Feed, Buscar, Ingressos, Favoritos, Perfil |
| `ArtistNavigator` | Artista | Home, Vagas, Agenda, Candidaturas, Perfil |
| `EstablishmentNavigator` | Estabelecimento | Home, Vagas, Buscar, Agenda, Perfil |

O roteamento pós-login é determinado pela resposta de `/usuarios/minhas-paginas`, que indica quais perfis o usuário possui.

---

## Motivação

- Multiplataforma com única base de código reduz tempo e custo de desenvolvimento.
- A equipe já domina React e TypeScript, eliminando curva de aprendizado.
- Expo simplifica build, testes em dispositivo e hot reload.
- React Navigation é a solução de roteamento mais madura para React Native.

---

## Consequências

### Positivas

- Entrega acelerada para Android e iOS.
- Ecossistema amplo com bibliotecas estáveis.
- Desenvolvimento iterativo com hot reload.

### Negativas

- Expo limita acesso a algumas APIs nativas avançadas.
- Performance inferior ao desenvolvimento nativo em cenários gráficos intensos.
- Dependência do ecossistema Expo para builds de produção.
