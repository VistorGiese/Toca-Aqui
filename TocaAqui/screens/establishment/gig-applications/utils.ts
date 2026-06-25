import { Candidatura } from "@/http/establishmentService";
import { ApplicationTab } from "./types";

export function filterCandidatesByTab(
  candidates: Candidatura[],
  tab: ApplicationTab
): Candidatura[] {
  return candidates.filter((candidate) => {
    if (tab === "pendente") return candidate.status === "pendente";
    if (tab === "favoritas") return candidate.favorited;
    return true;
  });
}

export function getArtistDisplayName(candidate: Candidatura): string {
  return (
    candidate.nome_artista ??
    `Artista #${candidate.artista_id ?? candidate.banda_id ?? candidate.id}`
  );
}

export function isBandaApplication(candidate: Candidatura): boolean {
  return Boolean(candidate.banda_id && !candidate.artista_id);
}

export function canAcceptNew(candidate: Candidatura, eventClosed: boolean): boolean {
  return !eventClosed && candidate.status === "pendente" && candidate.id > 0;
}

export function canReaccept(candidate: Candidatura, eventClosed: boolean): boolean {
  return !eventClosed && candidate.status === "rejeitado" && candidate.id > 0;
}

export function formatPropostaValor(valor?: number | null): string {
  if (valor == null) return "A combinar";
  return `R$ ${Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
