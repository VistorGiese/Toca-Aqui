export interface ContractPreview {
  tituloEvento: string;
  localEvento: string;
  cacheTotal: string;
  horarioInicio: string;
  horarioFim: string;
  nomeContratante: string;
}

export interface ContractDetailDisplay {
  refNumber: string;
  formattedDate: string;
  preview: ContractPreview;
  artistCanSeeContract: boolean;
  artistMustResubmit: boolean;
  workflowStatus: string;
}

export type ContractData = Awaited<ReturnType<typeof import("@/http/contractService").contractService.getContractById>>;
