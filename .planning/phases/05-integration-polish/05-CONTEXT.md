# Phase 5: Integration Polish - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fechar os gaps que restam para a demo do TCC funcionar ponta-a-ponta sem erros visíveis: rota para concluir contrato (ativa o incremento de `shows_realizados`), avaliação do artista pelo estabelecimento (EstRateArtist minimamente funcional), e loading states em todas as telas do fluxo principal.

</domain>

<decisions>
## Implementation Decisions

### Concluir contrato (05-01 — profile-stats)

- **D-01:** Adicionar rota `PUT /contratos/:id/concluir` no backend — chama `contractService.completeContract()` que já existe e já incrementa `shows_realizados`. Middleware: `authMiddleware`, acesso restrito ao contratante (estabelecimento).
- **D-02:** Botão "Marcar como Realizado" aparece em `EstShowDetail` quando `contract.status === 'aceito'`. Após confirmar (Alert), chama a nova rota. Na resposta de sucesso, recarrega o contrato — status vira 'concluido' e o botão "AVALIAR ARTISTA" existente fica visível.
- **D-03:** `nota_media` fica null — não será atualizada nesta fase. O frontend já exibe "— ★" quando null. Decisão: honesto com o estado real, sem gambiarra.

### EstRateArtist — avaliação do artista pelo estabelecimento (05-02 — onpress-audit)

- **D-04:** EstRateArtist UI já está 100% implementada. `establishmentService.rateArtist()` chama `POST /avaliacoes` com `contrato_id` — mas essa rota é incompatível (espera `agendamento_id` + ingresso). Solução: criar rota `POST /contratos/:id/avaliar-artista` no backend, e atualizar `establishmentService.rateArtist` para chamar `/contratos/${contratoId}/avaliar-artista`.
- **D-05:** O endpoint `avaliar-artista` deve: verificar que o chamador é o estabelecimento contratante, verificar que contrato está `concluido`, persistir a avaliação (pode reusar `AvaliacaoShowModel` ou criar registro simples), e atualizar `nota_media` em `ArtistProfileModel` com a média recalculada.
- **D-06:** `nota_media` é atualizada **apenas** via `avaliar-artista` (pós-show pelo estabelecimento). Não via `completeContract()`.

### UserCheckout — manter como está

- **D-07:** Botões que navegam para `UserCheckout` em `UserShowDetail` e `UserArtistProfile` são mantidos. `UserCheckout` já existe como tela — a navegação funciona mesmo que o pagamento não feche. Nenhuma alteração necessária.

### onPress vazio — demais botões (05-02)

- **D-08:** Auditar telas do fluxo principal em busca de `onPress` vazio ou sem handler real. Para botões irrelevantes ao TCC (que não sejam checkout nem rate): remover o TouchableOpacity ou substituir por `View` não-clicável. Não usar Alert "Em breve" — tela limpa é preferível.
- **D-09:** Telas prioritárias para auditoria: `EstGigApplications`, `EstSchedule`, `EstShowDetail`, `ArtistSchedule`, `ArtistHome`, `MyApplications`, `ContractDetail`, `UserFeed`, `UserShowDetail`.

### Loading states (05-03)

- **D-10:** Padrão: `ActivityIndicator color="#A78BFA"` centralizado — já estabelecido nas fases anteriores.
- **D-11:** Escopo: todas as telas do fluxo principal — `EstGigApplications`, `EstSchedule`, `ArtistSchedule`, `MyApplications`, `ContractDetail`, `UserFeed`, `UserShowDetail`. Auditar cada uma e adicionar loading state apenas onde está faltando (sem duplicar onde já existe).
- **D-12:** Loading deve cobrir o fetch inicial (`loading` state booleano) e não a lista inteira — manter dados anteriores visíveis durante refetch quando possível.

### Claude's Discretion

- Estrutura exata do endpoint `avaliar-artista` (body fields, response shape)
- Recalculo de `nota_media`: `SELECT AVG(nota)` das avaliações existentes ou média incremental
- Posicionamento exato do botão "Marcar como Realizado" em `EstShowDetail` (acima ou abaixo do botão "Cancelar")
- Skeleton vs. ActivityIndicator: usar ActivityIndicator (padrão já estabelecido)

</decisions>

<specifics>
## Specific Ideas

- Fluxo demo completo esperado: criar evento → artista candidata → estabelecimento aceita → artista confirma → estabelecimento marca como realizado → estabelecimento avalia artista → `shows_realizados` e `nota_media` refletidos no perfil
- "Implementar EstRateArtist minimamente" — a tela já está pronta, só falta o backend responder corretamente

</specifics>

<canonical_refs>
## Canonical References

Não há specs ou ADRs externos. Requisitos capturados aqui e em REQUIREMENTS.md.

### Requisitos ativos desta fase
- `.planning/REQUIREMENTS.md` — REQ-17: nota_media e shows_realizados refletem dados reais após concluídos

### Código existente relevante
- `backend-TocaAqui/src/services/ContractService.ts` — método `completeContract()` (linhas 355-381): já implementado, já incrementa `shows_realizados`, sem rota ainda
- `backend-TocaAqui/src/routes/ContractRoutes.ts` — rotas existentes (sem `/concluir`); `POST /:id/avaliar` é artista→estabelecimento
- `TocaAqui/screens/establishment/EstShowDetail.tsx` — verifica `isConcluido`, exibe "AVALIAR ARTISTA" quando concluído; sem botão para marcar como concluído ainda
- `TocaAqui/screens/establishment/EstRateArtist.tsx` — UI completa, chama `establishmentService.rateArtist(contractId, { nota, comentario, tags })`
- `TocaAqui/http/establishmentService.ts` — `rateArtist()` chama `POST /avaliacoes` com `contrato_id` (rota errada — será corrigida)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `completeContract()` em `ContractService.ts`: implementação completa, só falta rota e botão
- `EstRateArtist.tsx`: tela pronta, estados de loading/submitting já implementados
- `ActivityIndicator color="#A78BFA"`: padrão de loading já em uso nas telas existentes
- `Alert.alert("Erro", msg)` no catch: padrão de error handling

### Established Patterns
- Autenticação em rotas: `authMiddleware` em todas as rotas protegidas
- Validação de ownership: verificar `perfil_estabelecimento_id` do contrato vs. usuário autenticado
- `contractService.ts` no frontend: service de contratos centralizado para novas chamadas

### Integration Points
- `EstShowDetail` → novo botão → `PUT /contratos/:id/concluir` → `completeContract()` → reload do contrato
- `EstRateArtist` → `establishmentService.rateArtist` → `POST /contratos/:id/avaliar-artista` → `nota_media` update
- Loading states: cada tela tem seu próprio `loading` state (padrão useState/useEffect existente)

</code_context>

<deferred>
## Deferred Ideas

- `nota_media` calculada via avaliações de audiência (REQ-19) — Out of Scope para o TCC
- `UserCheckout` com pagamento real via Stripe — Out of Scope para o TCC
- Avaliação do estabelecimento pelo artista (`RateEstablishment`) — rota `POST /contratos/:id/avaliar` já existe no backend, mas não é prioritária para a demo

</deferred>

---

*Phase: 05-integration-polish*
*Context gathered: 2026-04-02*
