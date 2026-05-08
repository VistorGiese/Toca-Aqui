# Plano de Testes — Backend Toca Aqui

**Cobertura atual:** ~54% global
**Meta:** ~85%+
**Total de testes hoje:** 491 passando, 37 suites

---

## Fase 1 — Services com 0% (alto impacto de negócio)

| Arquivo | Linhas | O que testar |
|---|---|---|
| `GeocodingService.ts` | 11-45 | Chamada ao Nominatim com resposta válida, array vazio (null), erro de rede (null) |
| `AvaliacaoShowService.ts` | 1-100 | criarAvaliacao (sucesso, contrato não concluído, já avaliado), getAvaliacoesByShow (com/sem avaliações, médias) |
| `ComentarioShowService.ts` | 1-126 | getComentariosByShow, criarComentario (texto vazio, parent válido/inválido), curtirComentario (toggle) |
| `IngressoService.ts` | 1-156 | comprarIngresso (sucesso, show esgotado, show não encontrado), getMeusIngressos (próximos/passados), getIngressoById (não encontrado, sem permissão) |
| `SeguidorArtistaService.ts` | 2-111 | seguirOuDesseguir (seguir, desseguir), getPerfilArtistaPublico (com/sem eu_sigo), getArtistasQueSigo |

---

## Fase 2 — Services parciais (lógica de negócio crítica)

| Arquivo | Cobertura | O que está faltando |
|---|---|---|
| `ShowService.ts` | 51% | getShowById (404), getShowsDestaque, searchShows (por artista, por local), filtros de data |
| `ContractService.ts` | 73% | editContract (sem permissão), cancelContract, completeContract, avaliarEstabelecimento, avaliarArtista |
| `BandApplicationService.ts` | 65% | applyBandToEvent (vaga fechada, já candidatou), acceptBandApplication, rejectBandApplication |
| `AuthService.ts` | 79% | logout (token já revogado), verifyEmail (token inválido), fluxo completo de resetPassword |

---

## Fase 3 — Controllers parciais

| Arquivo | Cobertura | O que está faltando |
|---|---|---|
| `UserController.ts` | 71% | `excluirConta` (sucesso, senha errada), `getMinhasPaginas` (com/sem perfis), `getPreferencias` |
| `BandApplicationController.ts` | 72% | `applyBandToEvent` (linhas 29-33: sem perfil artista), `getBandApplicationsForEvent` (linhas 46-48) |
| `FavoriteController.ts` | 74% | `getFavoritesByType` (35-42), `removeFavorite` (74, 100), `checkFavorite` (153) |
| `BookingController.ts` | 75% | `createBooking` sem perfil estabelecimento (23-25), filtros de listagem (77-85), `getByProximidade` (199-248) |
| `EstablishmentController.ts` | 78% | `listEstablishments` completo (16-70) com filtros de nome/tipo/cidade/gênero |
| `ContractController.ts` | 80% | `avaliarEstabelecimento`, `avaliarArtista`, `completeContractHandler` (189-232) |
| `BandController.ts` | 86% | Upload de foto com estabelecimento não encontrado (96-97), deleção de foto (154-165) |

---

## Fase 4 — Middleware e Schemas

| Arquivo | Cobertura | O que está faltando |
|---|---|---|
| `authorizationMiddleware.ts` | 55% | `checkEstablishmentAccess` (membro admin), `checkOwnership` (model inválido), `checkHasArtistProfile` (sem perfil), `checkAdmin` (role errada) |
| `bookingSchemas.ts` | 71% | Validação de campos opcionais (linhas 37, 43-46, 50) |
| `UploadService.ts` | 68% | `uploadSingle`, `uploadMultiple`, deleção de arquivo (26-34, 44-58) |

---

## Fase 5 — Services complexos (menor prioridade)

| Arquivo | Observação |
|---|---|
| `StripeService.ts` | Requer mock complexo do SDK Stripe — testar apenas as wrappers principais |
| `CronService.ts` | Jobs agendados — testar a lógica interna sem executar o cron em si |
| `PubSubService.ts` | Pub/sub em memória — testar publish/subscribe isoladamente |

---

## Resumo de esforço

| Fase | Arquivos | Testes estimados | Impacto na cobertura |
|---|---|---|---|
| 1 — Services zerados | 5 | ~45 | +12% |
| 2 — Services parciais | 4 | ~35 | +8% |
| 3 — Controllers parciais | 7 | ~40 | +6% |
| 4 — Middleware/Schemas | 3 | ~20 | +4% |
| 5 — Services complexos | 3 | ~25 | +3% |
| **Total** | **22** | **~165** | **~+33% → ~87%** |

---

## Status

- [x] Fase 1 — Services zerados
- [x] Fase 2 — Services parciais
- [x] Fase 3 — Controllers parciais
- [ ] Fase 4 — Middleware e Schemas
- [x] Fase 5 — Services complexos
