export const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  gold: "#F6C90E",
  success: "#10B981",
  bgSurface: "#1A1040",
} as const;

export const RATING_LABELS: Record<number, string> = {
  1: "EXPERIÊNCIA RUIM",
  2: "ABAIXO DA MÉDIA",
  3: "BOA EXPERIÊNCIA",
  4: "MUITO BOA EXPERIÊNCIA",
  5: "EXCELENTE EXPERIÊNCIA",
};

export const HIGHLIGHT_CHIPS = [
  { label: "Pagamento no prazo", positive: true },
  { label: "Ambiente profissional", positive: true },
  { label: "Equipamento ok", positive: true },
  { label: "Cancelou sem aviso", positive: false },
  { label: "Pagamento atrasado", positive: false },
] as const;

export const STAR_COUNT = 5;

export const COMMENT_PLACEHOLDER = "Descreva sua experiência com este estabelecimento...";
