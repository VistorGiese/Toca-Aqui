# CLAUDE.md — Toca Aqui

## O que é o projeto

**Toca Aqui** é um marketplace mobile de shows ao vivo que conecta artistas/bandas a estabelecimentos (bares, pubs, casas de show). O diferencial central é o fluxo de vaga → candidatura → contrato automático em PDF.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile | React Native + Expo (iOS & Android) |
| Backend principal | Node.js + Express + Sequelize |
| Banco principal | MySQL (Docker) |
| Microsserviço social | Node.js separado (comentários, avaliações, favoritos) |
| Gateway | Nginx |
| Infra | Docker Compose |

---

## Modelo de usuário

Existe **uma única role**: `user`. Dentro do perfil de um usuário, ele pode criar e gerenciar:

- **Página de artista** (músico solo, duo ou banda — tratados da mesma forma)
- **Página de estabelecimento** (bar, pub, casa de show)
- Um usuário pode ter ambas as páginas simultaneamente

Não há role separada no banco. A diferença é a existência ou não dos registros de `artist` / `establishment` vinculados ao `user`.

---

## Entidades principais

```
user
  └── artist (0..1)
  └── establishment (0..1)

establishment
  └── event (vaga de show publicada pelo estabelecimento)
        └── application (candidatura de um artista à vaga)
              └── contract (PDF gerado após confirmação)

event (com artista confirmado)
  └── ticket (compra pelo usuário comum — fora do MVP)

# Microsserviço social (banco separado)
comment (em artista ou estabelecimento)
rating  (avaliação pós-show, bidirecional)
favorite (usuário favorita artista ou estabelecimento)
```

---

## Fluxos core

### 1. Publicação de vaga (Estabelecimento)

1. Estabelecimento cria um `event` com: data, horário, duração, gênero musical desejado, cachê oferecido, descrição e estrutura disponível.
2. O evento fica com status `open`.

### 2. Candidatura (Artista)

1. Artista navega pelo feed de eventos abertos (filtros: gênero, data, localidade).
2. Artista visualiza o detalhe do evento e se candidata → cria `application` com status `pending`.
3. O artista vê suas candidaturas e status em sua agenda.

### 3. Seleção e contrato (Estabelecimento)

1. Estabelecimento abre o evento e vê a lista de candidatos.
2. Visualiza o perfil completo de cada artista candidato (EPK: bio, gênero, vídeos, histórico, avaliações).
3. Seleciona um artista, confirma o valor final e clica em "Gerar Contrato".
4. O sistema gera um **PDF automaticamente** com os dados do show (partes, data, horário, cachê, cláusula de cancelamento).
5. O PDF fica disponível para download/visualização por ambas as partes.
6. A `application` selecionada muda para `accepted`; as demais mudam para `rejected`.
7. O `event` muda para `confirmed`.

### 4. Visualização pública (Usuário comum)

1. Usuário comum navega pelo feed de eventos com status `confirmed` (artista já definido).
2. Visualiza detalhes do show: artista, estabelecimento, data, horário, gênero.
3. Pode visualizar perfil público do artista e do estabelecimento.
4. Pode comentar em perfis de artistas e estabelecimentos.
5. Pode avaliar após o show.
6. **Compra de ticket: fora do escopo do MVP.**

---

## Telas por perfil

### Artista
- Onboarding (criação de página: nome artístico, bio, gênero(s), vídeos, cachê base, estrutura que possui)
- Feed de eventos abertos (com filtros)
- Detalhe do evento + tela de candidatura
- Minhas candidaturas (status: pendente / aceito / recusado)
- Agenda (calendário com shows confirmados)
- Detalhe do show confirmado + acesso ao contrato PDF
- Perfil público (EPK)
- Avaliação pós-show
- Configurações de perfil

### Estabelecimento
- Onboarding (criação de página: nome, tipo, endereço, gêneros de interesse, estrutura)
- Home/Dashboard (métricas rápidas, eventos ativos, atalhos)
- Publicar novo evento (vaga)
- Meus eventos (lista com status)
- Detalhe do evento → lista de candidatos
- Perfil do artista candidato (visualização completa)
- Confirmação de artista + geração de contrato PDF
- Detalhe do show confirmado
- Busca proativa de artistas (filtros: gênero, localidade, cachê)
- Agenda
- Perfil público do estabelecimento
- Avaliação pós-show
- Configurações de perfil

### Usuário comum
- Onboarding (preferências musicais)
- Feed de shows confirmados
- Busca de shows (filtros)
- Detalhe do show
- Perfil público do artista
- Perfil público do estabelecimento
- Comentários e avaliações
- Favoritos
- Configurações de perfil

---

## Regras de negócio importantes

- Um `event` só pode ter **um** `application` com status `accepted`.
- Ao aceitar uma candidatura, todas as outras do mesmo evento são automaticamente `rejected`.
- O contrato PDF é gerado no momento da confirmação e armazenado; não é reassinado.
- Artistas no plano **gratuito** têm limite de 3 candidaturas/mês. No plano **pago** (R$ 29–39/mês), candidaturas ilimitadas + destaque no feed do estabelecimento.
- Avaliações são **bidirecionais**: artista avalia o estabelecimento e o estabelecimento avalia o artista, apenas após shows com status `confirmed` e data passada.
- Comentários e avaliações vivem no **microsserviço social** (banco separado).

---

## Geração do contrato PDF

- Acionada pelo endpoint `POST /contracts` após o estabelecimento confirmar o artista.
- O PDF deve conter: nome das partes, CNPJ/CPF, data e horário do show, local, cachê acordado, cláusula de cancelamento padrão, data de geração.
- Usar biblioteca `pdfkit` ou `puppeteer` para geração server-side.
- O arquivo é salvo em storage local (MVP) e a URL é gravada no registro do `contract`.

---

## Microsserviço social

Roda em porta separada, banco MySQL próprio. Expõe:

- `POST /comments` / `GET /comments?targetId=&targetType=`
- `POST /ratings` / `GET /ratings?targetId=&targetType=`
- `POST /favorites` / `DELETE /favorites` / `GET /favorites?userId=`

Comunicação do backend principal com o microsserviço via HTTP interno (não exposto ao cliente diretamente).

---

## Convenções de código

- TypeScript em todo o projeto.
- Sequelize como ORM (MySQL).
- Autenticação via JWT (Bearer token).
- Validação de entrada no backend em todos os endpoints.
- Erros retornam sempre `{ error: string, details?: any }`.
- Status HTTP semânticos: 201 para criação, 404 para não encontrado, 400 para erro de negócio, 403 para permissão negada.
- Verificar `ownership` em toda operação de escrita (usuário só altera seus próprios recursos).
