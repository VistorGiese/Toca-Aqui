import React from "react";
import { Text } from "react-native";
import ContractPdfWorkflowPanel from "@/components/contract/ContractPdfWorkflowPanel";
import { ContractData } from "../types";
import { styles } from "../styles";

interface Props {
  contractId: number;
  contract: ContractData;
  workflow: ReturnType<typeof import("@/components/contract/ContractPdfWorkflowPanel").useContractPdfWorkflow>["workflow"];
  workflowStatus: string;
  onRefresh: () => Promise<void>;
}

export default function ArtistContractDetailWorkflowSection({
  contractId,
  contract,
  workflow,
  workflowStatus,
  onRefresh,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Contrato Assinado</Text>
      <Text style={styles.workflowHint}>Status: {workflowStatus}</Text>
      <ContractPdfWorkflowPanel
        contractId={contractId}
        contractData={contract as unknown as Record<string, unknown>}
        role="artist"
        workflow={workflow}
        onRefresh={onRefresh}
      />
    </>
  );
}
