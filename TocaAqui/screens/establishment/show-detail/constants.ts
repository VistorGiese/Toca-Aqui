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

export const HEADER_TITLE = "Detalhe do Show";

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  aguardando_aceite: { label: "AGUARDANDO ARTISTA", color: DS.amber },
  aceito: { label: "CONFIRMADO", color: DS.success },
  concluido: { label: "REALIZADO", color: DS.cyan },
  cancelado: { label: "CANCELADO", color: DS.danger },
  recusado: { label: "RECUSADO", color: DS.danger },
};

export const PENDING_BANNER_MESSAGE =
  "Show privado — aguardando aprovação do contrato assinado para liberar venda de ingressos.";

export const CANCELLATION_CLAUSE_TEXT =
  "Cancelamentos com menos de 48h implicam em multa de 50% do cachê. Cancelamentos com mais de 7 dias são gratuitos.";

export const CANCEL_MOTIVO = "Cancelamento solicitado pelo estabelecimento";
