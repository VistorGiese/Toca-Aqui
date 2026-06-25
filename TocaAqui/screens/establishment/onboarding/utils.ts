import { EstablishmentTipo, WeekSchedule } from "./context/types";
import { WEEK_DAYS, createDefaultWeekSchedule } from "./constants";

export function mapTipoToBackend(tipo: string): string {
  const map: Record<string, string> = {
    bar: "bar",
    pub: "bar",
    restaurante: "restaurante",
    casa_show: "casa_show",
    espaco_privado: "outro",
  };
  return map[tipo] || "bar";
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function sanitizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function maskPhone(raw: string): string {
  const cleaned = raw.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length > 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length > 2) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length > 0) return `(${cleaned.slice(0, 2)}`;
  return cleaned;
}

export function maskCep(raw: string): string {
  const cleaned = raw.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length > 5) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return cleaned;
}

/** Máscara HH:MM enquanto o usuário digita. */
export function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function maskNumeroEndereco(raw: string): string {
  return raw.replace(/[^0-9A-Za-z/\-]/g, "").slice(0, 10);
}

export function maskCnpj(raw: string): string {
  const digits = sanitizeCnpj(raw).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function normalizeTime(value?: unknown): string {
  if (value == null || value === "") return "18:00";
  if (typeof value !== "string") {
    if (typeof value === "object" && value !== null) {
      const t = value as { hours?: number; minutes?: number };
      if (typeof t.hours === "number") {
        const h = String(t.hours).padStart(2, "0");
        const m = String(t.minutes ?? 0).padStart(2, "0");
        return `${h}:${m}`;
      }
    }
    return "18:00";
  }
  const parts = value.trim().split(":");
  const h = parts[0]?.padStart(2, "0") ?? "18";
  const m = (parts[1] ?? "00").padStart(2, "0").slice(0, 2);
  return `${h}:${m}`;
}

export function resolveOpeningHours(diasHorarios: WeekSchedule): {
  horarioAbertura: string;
  horarioFechamento: string;
} {
  const ativos = WEEK_DAYS.map((d) => diasHorarios[d.id]).filter((d) => d?.ativo);
  return {
    horarioAbertura: ativos.length > 0 ? normalizeTime(ativos[0].inicio) : "18:00",
    horarioFechamento: ativos.length > 0 ? normalizeTime(ativos[ativos.length - 1].fim) : "02:00",
  };
}

/** Formato TIME do MySQL/Sequelize (HH:mm:ss). */
export function toBackendTime(value: string): string {
  const normalized = normalizeTime(value);
  return /^\d{2}:\d{2}:\d{2}$/.test(normalized) ? normalized : `${normalized}:00`;
}

/** Reconstrói grade semanal a partir do par abertura/fechamento salvo no backend. */
export function scheduleFromOpeningHours(abertura?: string, fechamento?: string): WeekSchedule {
  const schedule = createDefaultWeekSchedule();
  const inicio = normalizeTime(abertura);
  const fim = normalizeTime(fechamento ?? "02:00");
  WEEK_DAYS.forEach((d) => {
    schedule[d.id] = { ativo: true, inicio, fim };
  });
  return schedule;
}

export function isValidEstablishmentTipo(tipo: string): tipo is EstablishmentTipo {
  return ["bar", "pub", "restaurante", "casa_show", "espaco_privado"].includes(tipo);
}
