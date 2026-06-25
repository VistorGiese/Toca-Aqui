import { EstablishmentProfileStats } from "@/http/establishmentService";

export interface EstProfileDisplayData {
  nome: string;
  tipoLabel: string;
  localizacao: string;
  telefone: string;
  descricao: string;
  generos: string[];
  fotosUrls: string[];
  coverUrl: string | null;
  isActive: boolean;
  abertura: string;
  fechamento: string;
  hasSchedule: boolean;
}

export const EMPTY_PROFILE_STATS: EstablishmentProfileStats = {
  totalEventos: 0,
  totalContratacoes: 0,
  totalAvaliacoes: 0,
};

export const EMPTY_DISPLAY: EstProfileDisplayData = {
  nome: "Meu Estabelecimento",
  tipoLabel: "ESPAÇO CULTURAL",
  localizacao: "",
  telefone: "",
  descricao: "",
  generos: [],
  fotosUrls: [],
  coverUrl: null,
  isActive: false,
  abertura: "--:--",
  fechamento: "--:--",
  hasSchedule: false,
};
