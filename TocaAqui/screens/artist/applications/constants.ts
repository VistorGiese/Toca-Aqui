import { ApplicationTab } from "./types";

export const DS = {
  bg: "#09090F",
  card: "#16163A",
  surface: "#1A1040",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSecondary: "#A0A0B8",
  textMuted: "#555577",
  danger: "#E53E3E",
  success: "#10B981",
  amber: "#F59E0B",
} as const;

export const APPLICATION_TABS: ApplicationTab[] = ["Em análise", "Aceitas", "Recusadas"];

export const TAB_COLORS: Record<ApplicationTab, string> = {
  "Em análise": DS.accent,
  Aceitas: DS.success,
  Recusadas: DS.danger,
};

export const EMPTY_MESSAGES: Record<ApplicationTab, string> = {
  "Em análise": "Nenhuma candidatura em análise",
  Aceitas: "Nenhum contrato aceito ainda",
  Recusadas: "Nenhuma candidatura recusada",
};
