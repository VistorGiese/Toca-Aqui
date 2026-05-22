export type EstablishmentTipo =
  | "bar"
  | "pub"
  | "restaurante"
  | "casa_show"
  | "espaco_privado";

export interface DaySchedule {
  ativo: boolean;
  inicio: string;
  fim: string;
}

export type WeekSchedule = Record<string, DaySchedule>;

export interface IbgeEstado {
  sigla: string;
  nome: string;
}

export interface IbgeCidade {
  id: number;
  nome: string;
}

export interface EstablishmentOnboardingDraft {
  nome: string;
  tipo: EstablishmentTipo | "";
  telefone: string;
  fotoUri: string | null;
  endereco: string;
  numero: string;
  cidade: string;
  estado: string;
  estadoNome: string;
  diasHorarios: WeekSchedule;
  generos: string[];
  temEstrutura: boolean;
  estrutura: string[];
  capacidade: string;
  bio: string;
  fotosUris: string[];
}

export const INITIAL_DRAFT: EstablishmentOnboardingDraft = {
  nome: "",
  tipo: "",
  telefone: "",
  fotoUri: null,
  endereco: "",
  numero: "",
  cidade: "",
  estado: "",
  estadoNome: "",
  diasHorarios: {},
  generos: [],
  temEstrutura: false,
  estrutura: [],
  capacidade: "",
  bio: "",
  fotosUris: [],
};

export const ONBOARDING_STEPS = [
  { step: 1, key: "identidade", label: "Identidade" },
  { step: 2, key: "funcionamento", label: "Funcionamento" },
  { step: 3, key: "perfil", label: "Perfil" },
  { step: 4, key: "apresentacao", label: "Apresentação" },
] as const;
