import type { ContractPdfWorkflowMeta } from "@/types/contractPdf";
import { mapApiContractToTemplateData } from "@/http/contractService";

export type ContractPreviewData = ReturnType<typeof mapApiContractToTemplateData>;

export type ActionButtonVariant = "primary" | "cyan" | "success" | "danger" | "secondary";

export interface ContractPreviewDisplay {
  gigTitle: string;
  artistName: string;
  preview: ContractPreviewData;
  workflowLabel: string;
  awaitingApproval: boolean;
  approved: boolean;
  showReviewSection: boolean;
  showDownloadSection: boolean;
  reviewHint: string;
}

export interface ContractPreviewState {
  loading: boolean;
  busy: boolean;
  contractRaw: Record<string, unknown> | null;
  workflow: ContractPdfWorkflowMeta | null;
  preview: ContractPreviewData | null;
}
