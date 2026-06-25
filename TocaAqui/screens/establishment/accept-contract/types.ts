export type ApplicationStatus = "pendente" | "aceito" | "rejeitado";

export type BannerVariant = "closed" | "rejected";

export interface AcceptContractDisplay {
  applicationId: number;
  gigTitle: string;
  artistName: string;
  valorProposto?: number;
  mensagem?: string;
  status: ApplicationStatus;
  isBanda: boolean;
  contratadoLabel: string;
  canAccept: boolean;
  canReject: boolean;
  isReaccept: boolean;
  eventClosed: boolean;
  showClosedBanner: boolean;
  showRejectedBanner: boolean;
}
