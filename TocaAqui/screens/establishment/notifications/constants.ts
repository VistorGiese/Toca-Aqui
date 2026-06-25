export const DS = {
  bg: "#09090F",
  card: "#13101F",
  surface: "#0F0B1E",
  border: "#1E1A30",
  accent: "#7B61FF",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const NOTIFICATION_ICON_MAP: Record<string, { name: string; color: string }> = {
  candidatura: { name: "user-check", color: "#7B61FF" },
  aplicacao: { name: "user-check", color: "#7B61FF" },
  contrato: { name: "file-contract", color: "#00CEC9" },
  pagamento: { name: "dollar-sign", color: "#00C853" },
  cancelamento: { name: "times-circle", color: "#EF4444" },
  cancelado: { name: "times-circle", color: "#EF4444" },
  avaliacao: { name: "star", color: "#F59E0B" },
  default: { name: "bell", color: "#8888AA" },
};
