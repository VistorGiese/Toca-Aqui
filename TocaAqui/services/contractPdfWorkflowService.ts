import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { contractService } from "@/http/contractService";
import { establishmentService } from "@/http/establishmentService";
import type {
  ContractPdfRole,
  ContractPdfWorkflowMeta,
  ContractPdfWorkflowStatus,
} from "@/types/contractPdf";
import { readFileAsBase64 } from "@/utils/generate-contract-pdf";

const WORKFLOW_PREFIX = "__WF__";
const PDF_PREFIX = "__B64__";

/** Limite alinhado ao schema do backend (TEXT ~64KB por campo). */
const TEXT_FIELD_LIMIT = 65000;

/** Campos editáveis usados para armazenar PDFs (via API existente). */
const EST_PDF_FIELDS = ["obrigacoes_contratante", "infraestrutura_som", "infraestrutura_backline"] as const;
const ART_PDF_FIELDS = ["obrigacoes_contratado", "intervalos", "infraestrutura_backline"] as const;

function parseWorkflow(raw?: string | null): ContractPdfWorkflowMeta | null {
  if (!raw || !raw.startsWith(WORKFLOW_PREFIX)) return null;
  try {
    return JSON.parse(raw.slice(WORKFLOW_PREFIX.length)) as ContractPdfWorkflowMeta;
  } catch {
    return null;
  }
}

function serializeWorkflow(meta: ContractPdfWorkflowMeta): string {
  return `${WORKFLOW_PREFIX}${JSON.stringify(meta)}`;
}

function fieldsForRole(role: ContractPdfRole): readonly string[] {
  return role === "est" ? EST_PDF_FIELDS : ART_PDF_FIELDS;
}

function maxChunkForField(field: string): number {
  return TEXT_FIELD_LIMIT - PDF_PREFIX.length;
}

function maxBytesForRole(role: ContractPdfRole): number {
  return fieldsForRole(role).reduce((sum, f) => sum + maxChunkForField(f), 0);
}

function buildPdfFieldPayload(base64: string, fields: readonly string[]): Record<string, string> {
  const payload: Record<string, string> = {};
  let offset = 0;

  for (const field of fields) {
    const maxChunk = maxChunkForField(field);
    if (offset >= base64.length) {
      payload[field] = "";
      continue;
    }
    const chunk = base64.slice(offset, offset + maxChunk);
    offset += chunk.length;
    payload[field] = `${PDF_PREFIX}${chunk}`;
  }

  if (offset < base64.length) {
    const maxTotal = fields.reduce((sum, f) => sum + maxChunkForField(f), 0);
    throw new Error(
      `PDF muito grande (${Math.round(base64.length / 1024)}KB). Máximo ~${Math.round(maxTotal / 1024)}KB.`
    );
  }

  return payload;
}

function extractPdfFromField(value?: string | null): string {
  if (!value || !value.startsWith(PDF_PREFIX)) return "";
  return value.slice(PDF_PREFIX.length);
}

function formatEditContractError(err: unknown): string {
  const ax = err as {
    response?: {
      status?: number;
      data?: { error?: string; detalhes?: { mensagem?: string }[] };
    };
  };
  if (ax.response?.status === 413) {
    return "PDF muito grande para enviar de uma vez. Tente um arquivo menor.";
  }
  const detalhes = ax.response?.data?.detalhes?.map((d) => d.mensagem).filter(Boolean).join("; ");
  if (detalhes) return detalhes;
  if (ax.response?.data?.error) return ax.response.data.error;
  if (err instanceof Error) return err.message;
  return "Não foi possível salvar o contrato.";
}

async function editContractSafe(contractId: number, payload: Record<string, unknown>): Promise<void> {
  try {
    await contractService.editContract(contractId, payload);
  } catch (err) {
    throw new Error(formatEditContractError(err));
  }
}

export async function fetchWorkflow(contractId: number): Promise<ContractPdfWorkflowMeta | null> {
  const raw = await contractService.getContractById(contractId);
  const contract = raw as Record<string, unknown>;
  const fromObs = parseWorkflow(contract.observacoes as string | undefined);
  if (fromObs) return fromObs;
  const fromIntervalos = parseWorkflow(contract.intervalos as string | undefined);
  if (fromIntervalos) return fromIntervalos;
  return loadWorkflowFromHistory(contractId);
}

async function loadWorkflowFromHistory(contractId: number): Promise<ContractPdfWorkflowMeta | null> {
  try {
    const history = await contractService.getContractHistory(contractId);
    const entry = history.find((h) => String(h.valor_novo ?? "").startsWith(WORKFLOW_PREFIX));
    if (!entry?.valor_novo) return null;
    return parseWorkflow(entry.valor_novo);
  } catch {
    return null;
  }
}

export async function saveWorkflow(
  contractId: number,
  status: ContractPdfWorkflowStatus,
  extra?: Partial<ContractPdfWorkflowMeta>
): Promise<ContractPdfWorkflowMeta> {
  const current = (await fetchWorkflow(contractId)) ?? { v: 1 as const, s: "generated" as const };
  const next: ContractPdfWorkflowMeta = {
    ...current,
    ...extra,
    v: 1,
    s: status,
    updatedAt: new Date().toISOString(),
  };
  await editContractSafe(contractId, {
    observacoes: serializeWorkflow(next),
  });
  return next;
}

export async function attachSignedPdf(
  contractId: number,
  role: ContractPdfRole,
  fileUri: string
): Promise<void> {
  const base64 = await readFileAsBase64(fileUri);
  const fields = fieldsForRole(role);
  const maxTotal = maxBytesForRole(role);

  if (base64.length > maxTotal) {
    throw new Error(
      `PDF muito grande (${Math.round(base64.length / 1024)}KB). Máximo ~${Math.round(maxTotal / 1024)}KB. Use um PDF mais compacto.`
    );
  }

  const pdfPayload = buildPdfFieldPayload(base64, fields);
  const parts = Object.values(pdfPayload).filter((v) => v.length > PDF_PREFIX.length).length;

  const status: ContractPdfWorkflowStatus =
    role === "est" ? "est_signed_attached" : "artist_signed_attached";

  const current = (await fetchWorkflow(contractId)) ?? { v: 1 as const, s: "generated" as const };
  const pdfMeta = { storage: "fields" as const, parts };
  const wfExtra = role === "est" ? { estPdf: pdfMeta } : { artPdf: pdfMeta };

  const next: ContractPdfWorkflowMeta = {
    ...current,
    ...wfExtra,
    v: 1,
    s: status,
    updatedAt: new Date().toISOString(),
  };

  // Envia um campo por requisição para não estourar limite do body HTTP
  for (const [field, value] of Object.entries(pdfPayload)) {
    if (!value) continue;
    await editContractSafe(contractId, { [field]: value });
  }

  await editContractSafe(contractId, {
    observacoes: serializeWorkflow(next),
  });
}

async function loadPdfFromFields(contract: Record<string, unknown>, role: ContractPdfRole): Promise<string> {
  const fields = fieldsForRole(role);
  const parts = fields.map((f) => extractPdfFromField(contract[f] as string | undefined));
  return parts.join("");
}

async function loadPdfFromHistory(contractId: number, role: ContractPdfRole): Promise<string> {
  const history = await contractService.getContractHistory(contractId);
  const marker = `__PDF_${role.toUpperCase()}__`;
  const chunks = history
    .filter((h) => String(h.valor_novo ?? "").startsWith(marker))
    .map((h) => {
      const val = String(h.valor_novo);
      const idx = val.indexOf(":");
      return { order: val.slice(marker.length, idx), data: val.slice(idx + 1) };
    })
    .sort((a, b) => {
      const [ai] = a.order.split("/").map(Number);
      const [bi] = b.order.split("/").map(Number);
      return ai - bi;
    })
    .map((c) => c.data);

  return chunks.join("");
}

export async function downloadAttachedPdf(
  contractId: number,
  role: ContractPdfRole
): Promise<string | null> {
  const raw = await contractService.getContractById(contractId);
  const contract = raw as Record<string, unknown>;
  const wf = await fetchWorkflow(contractId);

  let base64 = "";
  const meta = role === "est" ? wf?.estPdf : wf?.artPdf;

  if (meta?.storage === "history") {
    base64 = await loadPdfFromHistory(contractId, role);
  } else {
    base64 = await loadPdfFromFields(contract, role);
    if (!base64) {
      base64 = await loadPdfFromHistory(contractId, role);
    }
  }

  if (!base64) return null;

  const fileName = `contrato-assinado-${role}-${contractId}.pdf`;
  const dest = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(dest, {
      mimeType: "application/pdf",
      dialogTitle: "Baixar Contrato Assinado",
      UTI: "com.adobe.pdf",
    });
  }

  return dest;
}

export async function sendToArtist(contractId: number): Promise<void> {
  await saveWorkflow(contractId, "sent_to_artist", { sentAt: new Date().toISOString() });
}

export async function sendToEstablishment(contractId: number): Promise<void> {
  await saveWorkflow(contractId, "awaiting_approval");
}

function formatGigUpdateError(err: unknown): string {
  const ax = err as { response?: { data?: { error?: string; message?: string } } };
  if (ax.response?.data?.error) return ax.response.data.error;
  if (ax.response?.data?.message) return ax.response.data.message;
  if (err instanceof Error) return err.message;
  return "Não foi possível publicar o show.";
}

/** Última etapa do fluxo PDF: aprova e libera venda de ingressos. */
export async function publishShowAfterContractApproval(
  contractId: number,
  eventoId: number
): Promise<void> {
  try {
    await establishmentService.updateGig(eventoId, { esta_publico: true });
  } catch (err) {
    throw new Error(formatGigUpdateError(err));
  }
  await saveWorkflow(contractId, "approved", { approvedAt: new Date().toISOString() });
}

/** Corrige shows aprovados no workflow mas ainda privados (ex.: falha anterior ao publicar). */
export async function syncShowPublicationIfApproved(
  eventoId: number,
  workflow: ContractPdfWorkflowMeta | null
): Promise<void> {
  if (workflow?.s !== "approved") return;
  try {
    const gig = await establishmentService.getGigById(eventoId);
    if (!gig.esta_publico) {
      await establishmentService.updateGig(eventoId, { esta_publico: true });
    }
  } catch {
    // falha silenciosa — usuário pode tentar aprovar novamente se necessário
  }
}

export function workflowStatusLabel(status?: ContractPdfWorkflowStatus): string {
  const map: Record<ContractPdfWorkflowStatus, string> = {
    generated: "Contrato gerado",
    est_signed_attached: "Contrato assinado anexado",
    sent_to_artist: "Enviado ao artista",
    artist_signed_attached: "Artista anexou contrato assinado",
    awaiting_approval: "Aguardando aprovação",
    approved: "Contrato aprovado — show público",
  };
  return status ? map[status] : "—";
}

export function canEstDownloadTemplate(wf: ContractPdfWorkflowMeta | null): boolean {
  return !wf || wf.s !== "approved";
}

export function canEstAttachSigned(wf: ContractPdfWorkflowMeta | null): boolean {
  return !wf || wf.s === "generated" || wf.s === "est_signed_attached";
}

export function canEstSendToArtist(wf: ContractPdfWorkflowMeta | null): boolean {
  return wf?.s === "est_signed_attached";
}

export function canEstApprove(wf: ContractPdfWorkflowMeta | null): boolean {
  return wf?.s === "awaiting_approval" || wf?.s === "artist_signed_attached";
}

export function canArtistViewSigned(wf: ContractPdfWorkflowMeta | null): boolean {
  return (
    wf?.s === "sent_to_artist" ||
    wf?.s === "artist_signed_attached" ||
    wf?.s === "awaiting_approval" ||
    wf?.s === "approved"
  );
}

export function canArtistAttachSigned(wf: ContractPdfWorkflowMeta | null): boolean {
  return wf?.s === "sent_to_artist" || wf?.s === "artist_signed_attached";
}

export function canArtistSend(wf: ContractPdfWorkflowMeta | null): boolean {
  return wf?.s === "artist_signed_attached";
}

export function isShowPublic(wf: ContractPdfWorkflowMeta | null): boolean {
  return wf?.s === "approved";
}
