import { EstablishmentTipo } from "./context/types";
import { WeekSchedule } from "./context/types";

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

export function maskCnpj(raw: string): string {
  const digits = sanitizeCnpj(raw).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function resolveOpeningHours(diasHorarios: WeekSchedule): {
  horarioAbertura: string;
  horarioFechamento: string;
} {
  const ativos = Object.values(diasHorarios).filter((d) => d.ativo);
  return {
    horarioAbertura: ativos.length > 0 ? ativos[0].inicio : "18:00",
    horarioFechamento: ativos.length > 0 ? ativos[ativos.length - 1].fim : "02:00",
  };
}

export function isValidEstablishmentTipo(tipo: string): tipo is EstablishmentTipo {
  return ["bar", "pub", "restaurante", "casa_show", "espaco_privado"].includes(tipo);
}
