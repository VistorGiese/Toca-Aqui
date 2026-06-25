import { ApplicationStatus } from "./types";

export const DS = {
  bg: "#09090F",
  card: "#13101F",
  surface: "#0F0B1E",
  border: "#1E1A30",
  accent: "#7B61FF",
  cyan: "#00CEC9",
  success: "#00C853",
  danger: "#EF4444",
  amber: "#F59E0B",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const STATUS_LABEL: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  pendente: { label: "PENDENTE", color: DS.amber },
  aceito: { label: "ACEITA", color: DS.success },
  rejeitado: { label: "RECUSADA", color: DS.danger },
};

export const CLOSED_EVENT_MESSAGE = "Este evento já possui candidatura aceita.";

export const REACCEPT_BANNER_MESSAGE =
  "Este artista foi recusado anteriormente. Você pode aceitar a candidatura novamente.";

export const HIRING_INFO_TEXT =
  "Ao aceitar, o artista será confirmado para este evento, um contrato será gerado automaticamente e as demais candidaturas pendentes serão recusadas.";
