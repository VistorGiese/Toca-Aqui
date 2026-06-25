import { NOTIFICATION_ICON_MAP } from "./constants";
import { EstNotification } from "./types";

export function getNotificationIcon(tipo?: string) {
  if (!tipo) return NOTIFICATION_ICON_MAP.default;
  const normalized = tipo.toLowerCase();
  for (const key of Object.keys(NOTIFICATION_ICON_MAP)) {
    if (key !== "default" && normalized.includes(key)) {
      return NOTIFICATION_ICON_MAP[key];
    }
  }
  return NOTIFICATION_ICON_MAP.default;
}

export function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  } catch {
    return "";
  }
}

export function getNotificationMessage(item: EstNotification): string {
  return item.mensagem ?? item.conteudo ?? "Nova notificação";
}

export function getNotificationTimestamp(item: EstNotification): string {
  return item.created_at ?? item.criado_em ?? "";
}

/** Mantém apenas notificações do usuário autenticado. */
export function filterNotificationsByUser(
  items: EstNotification[],
  userId?: number | null
): EstNotification[] {
  if (!userId) return [];
  return items.filter((item) => Number(item.usuario_id) === Number(userId));
}
