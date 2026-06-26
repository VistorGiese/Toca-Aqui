export const DS = {
  bg: "#09090F",
  card: "#16163A",
  surface: "#1A1040",
  border: "#2D2545",
  accent: "#6C5CE7",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B8",
  textMuted: "#555577",
} as const;

export const SCREEN_TOP_PADDING = 60;

export const NOTIFICATION_ICON_MAP: Record<string, { name: string; color: string }> = {
  candidatura: { name: "user-check", color: "#6C5CE7" },
  aplicacao: { name: "user-check", color: "#6C5CE7" },
  contrato: { name: "file-contract", color: "#4ECDC4" },
  pagamento: { name: "dollar-sign", color: "#10B981" },
  cancelamento: { name: "times-circle", color: "#E53E3E" },
  cancelado: { name: "times-circle", color: "#E53E3E" },
  avaliacao: { name: "star", color: "#F59E0B" },
  default: { name: "bell", color: "#8888AA" },
};
