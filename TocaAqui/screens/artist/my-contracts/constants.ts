import { StatusConfig } from "./types";

export const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  success: "#10B981",
} as const;

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  rascunho: { color: "#6B7280", label: "Rascunho" },
  aguardando_aceite: { color: "#F59E0B", label: "Aguardando" },
  aceito: { color: "#10B981", label: "Aceito" },
  cancelado: { color: "#EF4444", label: "Cancelado" },
  recusado: { color: "#EF4444", label: "Recusado" },
  concluido: { color: "#3B82F6", label: "Concluído" },
};
