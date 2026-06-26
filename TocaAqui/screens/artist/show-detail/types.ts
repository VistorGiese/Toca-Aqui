import { Contract } from "@/http/contractService";

export interface ShowDetailDisplay {
  title: string;
  formattedDate: string;
  weekday: string;
  horarioInicio: string;
  horarioFim: string;
  cacheFormatted: string;
  establishmentName: string;
  endereco?: string;
  cidadeEstado?: string;
  responsavel?: {
    nome: string;
    cargo: string;
    initial: string;
  };
}

export interface TimelineItemProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  done: boolean;
}

export type ShowDetailContract = Contract & {
  nome_responsavel?: string;
  cargo_responsavel?: string;
};
