# Phase 3: Accept & Contract Flow - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Estabelecimento visualiza candidaturas com `valor_proposto`, aceita uma (backend recusa as demais e gera contrato automaticamente), artista visualiza o contrato gerado e confirma aceite. Cobre o fluxo do lado do estabelecimento (EstGigApplications → EstAcceptContract → EstShowDetail) e do lado do artista (MyApplications → ContractDetail → ArtistSchedule).

</domain>

<decisions>
## Implementation Decisions

### valor_proposto em EstGigApplications

- **D-01:** Exibir `valor_proposto` como linha extra no card de candidatura (abaixo da mensagem do artista), consistente com o padrão de MyApplications em Phase 2
- **D-02:** Quando `valor_proposto` é null/undefined, exibir "A combinar" — nunca omitir a linha completamente
- **D-03:** Interface `Candidatura` em `establishmentService.ts` deve incluir `valor_proposto?: number`
- **D-04:** Tab "favoritas" e botão coração ficam sem funcionalidade real (ignorar por enquanto — fora do escopo da defesa)

### valor_proposto em EstAcceptContract

- **D-05:** Adicionar exibição de `valor_proposto` no `infoCard` de EstAcceptContract — estabelecimento vê e confirma o valor antes de aceitar
- **D-06:** Passar `valorProposto?: number` como param adicional de EstGigApplications → EstAcceptContract via `navigation.navigate("EstAcceptContract", { applicationId, artistId, artistName, gigTitle, valorProposto })`
- **D-07:** `EstStackParamList.EstAcceptContract` deve adicionar `valorProposto?: number` (opcional para compatibilidade com navegação existente)

### Navegação pós-aceite (EstAcceptContract → EstShowDetail)

- **D-08:** Modificar `acceptBandApplication` no backend para retornar também o contrato gerado: `{ message, aplicacao, contrato }` — o `contractService.generateFromApplication()` já retorna o contrato
- **D-09:** Frontend extrai `contrato.id` do response de `acceptApplication` e navega para `EstShowDetail` com `{ contractId: contrato.id }`
- **D-10:** Fluxo: Alert.alert("Candidatura aceita!", "[Nome] foi contratado(a).", [{ text: "OK", onPress: () => navigation.navigate("EstShowDetail", { contractId }) }])

### Acesso ao ContractDetail pelo artista (MyApplications → ContractDetail)

- **D-11:** Backend deve incluir `contrato_id: number | null` na resposta de `/eventos/minhas` — valor não-null apenas quando candidatura está `aceito` e contrato foi gerado
- **D-12:** `BandApplication` interface no frontend deve incluir `contrato_id?: number`
- **D-13:** Em MyApplications, cards com `status === "aceito"` e `contrato_id` presente exibem botão "VER CONTRATO" separado abaixo do badge de status
- **D-14:** Botão "VER CONTRATO" navega para `ContractDetail` com `{ contractId: item.contrato_id }`

### ContractDetail — pós-assinatura

- **D-15:** Após `acceptContract` com sucesso, navegar para `ArtistSchedule` (em vez de `goBack()` atual) — artista vê o show confirmado na agenda imediatamente
- **D-16:** Alert "Contrato assinado!" com mensagem "Parabéns! O show foi confirmado. Abrindo sua agenda..." antes de navegar para ArtistSchedule

### Feedback de recusa (REQ-07)

- **D-17:** Status "recusado" visível em MyApplications é suficiente para satisfazer REQ-07 na defesa do TCC — nenhuma notificação in-app adicional necessária para artistas recusados em massa
- **D-18:** O backend já envia `APLICACAO_ACEITA` + `CONTRATO_GERADO` para o artista aceito — coberto sem mudança

### Claude's Discretion

- Formatação do valor proposto: `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` — consistente com EstShowDetail que já usa esse padrão
- `useFocusEffect` em EstGigApplications pode ser adicionado se necessário, mas `useEffect` é suficiente para o fluxo da demo
- Tratamento de erros: Alert.alert("Erro", msg) no catch — padrão existente

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Frontend — Telas de estabelecimento
- `TocaAqui/screens/establishment/EstGigApplications.tsx` — card de candidatura existente, tabs, chamada a `getGigApplications`
- `TocaAqui/screens/establishment/EstAcceptContract.tsx` — tela de revisão, chama `acceptApplication`, navegação pós-aceite
- `TocaAqui/screens/establishment/EstShowDetail.tsx` — já bastante completo, recebe `contractId` via params
- `TocaAqui/navigation/EstablishmentNavigator.tsx` — `EstStackParamList` (adicionar `valorProposto` em EstAcceptContract)

### Frontend — Telas de artista
- `TocaAqui/screens/artist/ContractDetail.tsx` — UI + botão assinar já existentes; pós-assinatura navega para ArtistSchedule
- `TocaAqui/screens/artist/ArtistSchedule.tsx` — destino de navegação pós-assinatura

### Frontend — Serviços
- `TocaAqui/http/establishmentService.ts` — `Candidatura` interface (adicionar `valor_proposto`, `contrato_id`), `acceptApplication` (extrair `contrato.id` do response)
- `TocaAqui/http/contractService.ts` — `acceptContract`, `getContractById`; interface `Contract`
- `TocaAqui/http/bandApplicationService.ts` — `getMyApplications` (resposta deve incluir `contrato_id`)

### Backend
- `backend-TocaAqui/src/services/BandApplicationService.ts` — `accept()`: bulk reject + `generateFromApplication`; `apply()`
- `backend-TocaAqui/src/controllers/BandApplicationController.ts` — `acceptBandApplication` retorna `{ message, aplicacao }` → modificar para incluir `contrato`
- `backend-TocaAqui/src/services/ContractService.ts` — `generateFromApplication()` retorna `ContractModel`
- `backend-TocaAqui/src/routes/BandApplicationRoutes.ts` — rotas existentes

### Requisitos
- `.planning/REQUIREMENTS.md` — REQ-07 a REQ-14

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EstGigApplications.tsx` — card com nome, gênero, nota_media, shows_realizados, mensagem, botões VER PERFIL + ACEITAR — só falta `valor_proposto` e `contrato_id`
- `EstAcceptContract.tsx` — UI completa com infoCard, botões aceitar/recusar — só falta exibir valor e corrigir navegação pós-aceite
- `EstShowDetail.tsx` — praticamente completo — exibe status, evento, data, cachê, artista, botões cancelar/avaliar
- `ContractDetail.tsx` — `handleAssinar` já chama `contractService.acceptContract(contractId)` — só falta alterar navegação pós-assinatura
- `contractService.ts` — `acceptContract`, `getMyContracts`, `getContractById` já existem

### Established Patterns
- Navegação em telas de estabelecimento: `NativeStackNavigationProp<EstStackParamList>` + `useNavigation<NavProp>()`
- Alert de confirmação antes de ação destrutiva: `Alert.alert(title, msg, [cancel, confirm])`
- Design system `DS` consistente em telas de estabelecimento (bg, surface, card, border, accent, cyan, success, danger)
- Loading state: `ActivityIndicator size="large" color={DS.accent}` em container centralizado

### Integration Points
- `BandApplicationController.acceptBandApplication` retorna `{ message, aplicacao }` — **MODIFICAR** para retornar `{ message, aplicacao, contrato }`
- `BandApplicationService.accept()` já retorna o resultado de `generateFromApplication` via `contrato` local — expor esse valor no controller
- Backend `/eventos/minhas` (`getMyApplications`) — precisa incluir `contrato_id` no JOIN/query result
- `EstStackParamList` — adicionar `valorProposto?: number` nos params de `EstAcceptContract`

</code_context>

<specifics>
## Specific Ideas

- `valor_proposto` na linha do card: `💰 R$ 350,00` ou `Proposta: R$ 350,00` — usar texto simples sem emoji para manter padrão do design system
- Linha valor no card EstGigApplications: adicionar entre `item.mensagem` e `<View style={s.actions}>`
- Controller: `const contrato = await contractService.generateFromApplication(aplicacao.id)` já acontece dentro de `bandApplicationService.accept()` — precisamos que esse valor seja retornado pelo `accept()` e incluído na resposta do controller
- `ArtistSchedule` usa `ArtistStackParamList` — `ContractDetail.tsx` já usa `NativeStackNavigationProp<ArtistStackParamList>`, então `navigation.navigate("ArtistSchedule")` funciona sem params

</specifics>

<deferred>
## Deferred Ideas

- Tab "favoritas" com funcionalidade real → out of scope para o TCC
- Notificação in-app para artistas recusados → out of scope para o TCC
- Edição de termos do contrato (cláusulas, penalidades) → out of scope
- Histórico de contratos completo → Phase 5 ou out of scope

</deferred>

---

*Phase: 03-accept-contract-flow*
*Context gathered: 2026-04-02 via discuss-phase*
