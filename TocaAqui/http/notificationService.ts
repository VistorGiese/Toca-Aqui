import api from "./api";
import { Notification } from "../types";

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const e = data as Record<string, unknown>;
    for (const key of ["data", "items", "notificacoes", "results"]) {
      if (Array.isArray(e[key])) return e[key] as T[];
    }
  }
  return [];
}

const getNotifications = async (): Promise<Notification[]> => {
  try {
    const r = await api.get("/notificacoes");
    return toArray<Notification>(r.data);
  } catch {
    return [];
  }
};

const markAsRead = async (id: number): Promise<void> => {
  await api.patch(`/notificacoes/${id}/lida`);
};

const markAllAsRead = async (): Promise<void> => {
  await api.patch("/notificacoes/todas/lida");
};

export const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
