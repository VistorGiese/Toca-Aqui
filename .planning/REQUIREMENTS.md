# Requirements — Toca Aqui v1.0

## Scope

**v1.0 goal:** Fluxo completo de contratação de show funcionando sem erros visíveis para a defesa do TCC.

---

## Must Have (v1)

### Infraestrutura e Bugs

- **REQ-01** — Todas as rotas do `bandApplicationService` no frontend devem corresponder às rotas registradas no backend (`BandApplicationRoutes.ts`)
- **REQ-02** — Telas de listagem (candidaturas, contratos, agenda) devem carregar dados reais — sem listas vazias por erro de rota ou parâmetro
- **REQ-03** — Navegação entre telas do fluxo principal (aplicar → confirmação → contrato → detalhe) deve funcionar sem erros de parâmetro faltando

### Fluxo do Artista

- **REQ-04** — Artista pode navegar eventos disponíveis em `BrowseEvents` e ver apenas eventos com status aberto (`pendente`)
- **REQ-05** — Artista pode se candidatar a um evento informando um valor proposto (`valor_proposto`)
- **REQ-06** — Artista pode ver suas candidaturas em `MyApplications` com status atualizado (pendente / aceito / recusado)
- **REQ-07** — Artista recebe notificação/feedback quando sua candidatura é aceita ou recusada
- **REQ-08** — Artista pode visualizar o contrato gerado (`ContractDetail`) e confirmar aceite

### Fluxo do Estabelecimento

- **REQ-09** — Estabelecimento pode criar um evento com data, local, descrição e cachê base (`EstNewGig`)
- **REQ-10** — Estabelecimento pode visualizar candidaturas recebidas (`EstGigApplications`) com o valor proposto por cada artista
- **REQ-11** — Estabelecimento pode aceitar uma candidatura específica
- **REQ-12** — Ao aceitar uma candidatura, o sistema deve automaticamente recusar todas as outras candidaturas do mesmo evento
- **REQ-13** — Ao aceitar, um contrato deve ser gerado com status `aguardando_aceite`
- **REQ-14** — Estabelecimento pode visualizar o detalhe do show confirmado (`EstShowDetail`) após o artista assinar

### Usuário Comum

- **REQ-15** — Usuário comum pode navegar o feed de eventos (`UserFeed`) com eventos reais do banco
- **REQ-16** — Usuário comum pode ver o detalhe de um evento (`UserShowDetail`) com descrição, data, local e artista confirmado (se houver)

---

## Should Have (v1, se der tempo)

- **REQ-17** — `nota_media` e `shows_realizados` nos perfis refletem dados reais após shows concluídos *(migration já aplicada, falta trigger no ContractService)*
- **REQ-18** — Usuário comum pode comprar ingresso para um evento (`UserCheckout`)
- **REQ-19** — Avaliação pós-show funcional para artista e estabelecimento

---

## Out of Scope (v1)

- Pagamento via Stripe no frontend — backend existe mas UI não será implementada para o TCC
- Microserviço `social-service` — código morto, não será integrado
- Notificações push reais — apenas in-app
- Sistema de chat entre artista e estabelecimento
- Admin dashboard

---

## Acceptance Criteria (TCC Demo)

Para a defesa, deve ser possível demonstrar:

1. Login como estabelecimento → criar evento → ver candidaturas de artistas
2. Login como artista → ver evento → se candidatar com valor → ver status mudando
3. Como estabelecimento → aceitar candidatura → verificar que outras foram recusadas
4. Como artista → ver contrato gerado → confirmar aceite
5. Login como usuário comum → ver feed → abrir detalhe de um evento

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-01 | Phase 1 — Foundation | Pending |
| REQ-02 | Phase 1 — Foundation | Pending |
| REQ-03 | Phase 1 — Foundation | Pending |
| REQ-04 | Phase 2 — Artist Application Flow | Pending |
| REQ-05 | Phase 2 — Artist Application Flow | Pending |
| REQ-06 | Phase 2 — Artist Application Flow | Pending |
| REQ-07 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-08 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-09 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-10 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-11 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-12 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-13 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-14 | Phase 3 — Accept & Contract Flow | Pending |
| REQ-15 | Phase 4 — User Feed | Pending |
| REQ-16 | Phase 4 — User Feed | Pending |
| REQ-17 | Phase 5 — Integration Polish | Pending |
