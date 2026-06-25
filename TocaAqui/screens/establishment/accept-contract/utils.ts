import { ApplicationStatus, AcceptContractDisplay } from "./types";

interface BuildDisplayParams {
  applicationId: number;
  gigTitle: string;
  artistName: string;
  valorProposto?: number;
  mensagem?: string;
  status: ApplicationStatus;
  artistaId?: number;
  bandaId?: number;
  eventClosed?: boolean;
}

export function formatPropostaValor(valor?: number): string {
  if (valor == null) return "A combinar";
  return `R$ ${Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function buildAcceptContractDisplay(params: BuildDisplayParams): AcceptContractDisplay {
  const isBanda = Boolean(params.bandaId && !params.artistaId);
  const eventClosed = Boolean(params.eventClosed);
  const canAccept =
    !eventClosed &&
    (params.status === "pendente" || params.status === "rejeitado") &&
    params.applicationId > 0;
  const canReject =
    !eventClosed && params.status === "pendente" && params.applicationId > 0;
  const isReaccept = params.status === "rejeitado";

  return {
    applicationId: params.applicationId,
    gigTitle: params.gigTitle,
    artistName: params.artistName,
    valorProposto: params.valorProposto,
    mensagem: params.mensagem,
    status: params.status,
    isBanda,
    contratadoLabel: isBanda ? "BANDA" : "ARTISTA",
    canAccept,
    canReject,
    isReaccept,
    eventClosed,
    showClosedBanner: eventClosed,
    showRejectedBanner: isReaccept && !eventClosed,
  };
}

export function extractContractFromResponse(response: unknown): {
  contrato: Record<string, unknown> | null;
  contractId: number | null;
} {
  const payload = response as Record<string, unknown> | null | undefined;
  const nested = payload?.data as Record<string, unknown> | undefined;
  const contrato = (payload?.contrato ?? nested?.contrato ?? null) as Record<string, unknown> | null;
  const contractId = contrato?.id != null ? Number(contrato.id) : null;

  return { contrato, contractId };
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const error = err as { response?: { data?: { error?: string; message?: string } } };
  return error?.response?.data?.error ?? error?.response?.data?.message ?? fallback;
}
