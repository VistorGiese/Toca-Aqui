/**
 * Limite por campo no armazenamento de PDF (base64) — alinhado ao backend.
 * 3 chunks × este valor ≈ tamanho máximo do arquivo (~10 MB em base64).
 */
export const PDF_TEXT_FIELD_LIMIT = 4_500_000;

export type ContractPdfWorkflowStatus =
  | "generated"
  | "est_signed_attached"
  | "sent_to_artist"
  | "artist_signed_attached"
  | "awaiting_approval"
  | "approved";

export interface ContractPdfWorkflowMeta {
  v: 1;
  s: ContractPdfWorkflowStatus;
  estPdf?: { storage: "fields" | "history"; parts: number };
  artPdf?: { storage: "fields" | "history"; parts: number };
  sentAt?: string;
  sentToEstAt?: string;
  artistRejectedAt?: string;
  approvedAt?: string;
  updatedAt?: string;
}

export interface ContractTemplateData {
  nomeContratante: string;
  documentoContratante: string;
  telefoneContratante: string;
  enderecoContratante: string;
  nomeContratado: string;
  documentoContratado: string;
  telefoneContratado: string;
  tituloEvento: string;
  dataEvento: string;
  horarioInicio: string;
  horarioFim: string;
  duracaoMinutos: string;
  generoMusical: string;
  localEvento: string;
  cacheTotal: string;
  percentualSinal: string;
  valorSinal: string;
  metodoPagamento: string;
  penalidade72h: string;
  penalidade24_72h: string;
  penalidade24h: string;
  dataGeracao: string;
  refContrato: string;
}

export type ContractPdfRole = "est" | "artist";
