import React from "react";
import ContractPdfWorkflowPanel from "@/components/contract/ContractPdfWorkflowPanel";
import type { ContractPdfWorkflowMeta } from "@/types/contractPdf";
import { ContractDetail } from "../types";

interface Props {
  contractId: number;
  contract: ContractDetail;
  workflow: ContractPdfWorkflowMeta | null;
  onRefresh: () => Promise<void>;
  onApproved: () => Promise<void>;
}

export default function EstShowDetailWorkflowSection({
  contractId,
  contract,
  workflow,
  onRefresh,
  onApproved,
}: Props) {
  return (
    <ContractPdfWorkflowPanel
      contractId={contractId}
      eventoId={contract.evento_id ? Number(contract.evento_id) : undefined}
      contractData={contract as Record<string, unknown>}
      role="est"
      workflow={workflow}
      onRefresh={onRefresh}
      onApproved={onApproved}
    />
  );
}
