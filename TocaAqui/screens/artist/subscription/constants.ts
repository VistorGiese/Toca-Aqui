import { FeatureItem } from "./types";

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
  success: "#10B981",
  bgSurface: "#1A1040",
} as const;

export const FREE_FEATURES: FeatureItem[] = [
  { label: "3 candidaturas por mês", included: true },
  { label: "Perfil básico de artista", included: true },
  { label: "Destaque na busca", included: false },
  { label: "Selo de verificação", included: false },
];

export const PRO_FEATURES: FeatureItem[] = [
  { label: "Candidaturas ilimitadas", included: true },
  { label: "Perfil completo com portfólio", included: true },
  { label: "Destaque prioritário no feed", included: true },
  { label: "Selo de Artista Verificado", included: true },
  { label: "Estatísticas de visualização", included: true },
];

export const TRUST_ITEMS = [
  { icon: "lock", label: "Pagamento Seguro" },
  { icon: "undo", label: "Cancele quando quiser" },
  { icon: "headset", label: "Suporte Dedicado" },
] as const;
