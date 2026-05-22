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
