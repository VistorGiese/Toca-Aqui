import {
  canEstReviewArtistContract,
  isShowPublic,
  resolveWorkflow,
  workflowStatusLabel,
} from "@/services/contractPdfWorkflowService";
import type { ContractPdfWorkflowMeta } from "@/types/contractPdf";
import {
  REVIEW_HINT_APPROVED,
  REVIEW_HINT_AWAITING,
} from "./constants";
import { ContractPreviewData, ContractPreviewDisplay } from "./types";

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function buildContractPreviewDisplay(params: {
  gigTitle: string;
  artistName: string;
  preview: ContractPreviewData;
  workflow: ContractPdfWorkflowMeta | null;
  contractRaw: Record<string, unknown> | null;
}): ContractPreviewDisplay {
  const resolvedWorkflow = resolveWorkflow(params.workflow, params.contractRaw);
  const awaitingApproval = resolvedWorkflow?.s === "awaiting_approval";
  const approved = isShowPublic(resolvedWorkflow);
  const showReviewSection = canEstReviewArtistContract(resolvedWorkflow);

  return {
    gigTitle: params.gigTitle,
    artistName: params.artistName,
    preview: params.preview,
    workflowLabel: workflowStatusLabel(resolvedWorkflow?.s),
    awaitingApproval,
    approved,
    showReviewSection,
    showDownloadSection: !awaitingApproval && !approved,
    reviewHint: awaitingApproval ? REVIEW_HINT_AWAITING : REVIEW_HINT_APPROVED,
  };
}

export function getContractedName(artistName: string, preview: ContractPreviewData): string {
  return artistName || preview.nomeContratado;
}
