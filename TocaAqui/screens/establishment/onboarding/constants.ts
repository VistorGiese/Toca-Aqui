import { WeekSchedule } from "./context/types";

export const ESTABLISHMENT_TYPES = [
  { id: "bar" as const, label: "bar" },
  { id: "pub" as const, label: "pub" },
  { id: "restaurante" as const, label: "restaurante" },
  { id: "casa_show" as const, label: "casa de show" },
  { id: "espaco_privado" as const, label: "espaço privado" },
];

export const GENRE_OPTIONS = [
  { label: "Rock", color: "#A67C7C" },
  { label: "Eletrônica", color: "#00CEC9" },
  { label: "Sertanejo", color: "#C9A96E" },
  { label: "Jazz & Blues", color: "#6C3483" },
  { label: "MPB", color: "#27AE60" },
  { label: "Hip Hop", color: "#F39C12" },
  { label: "Pop", color: "#FF69B4" },
  { label: "Samba & Pagode", color: "#E67E22" },
];

export const SOUND_STRUCTURE_OPTIONS = [
  "Microfones",
  "Caixas",
  "Iluminação",
  "Mesa de Som",
  "Retornos",
  "Cabos/DI",
];

export const WEEK_DAYS = [
  { id: "seg", label: "SEGUNDA" },
  { id: "ter", label: "TERÇA" },
  { id: "qua", label: "QUARTA" },
  { id: "qui", label: "QUINTA" },
  { id: "sex", label: "SEXTA" },
  { id: "sab", label: "SÁBADO" },
  { id: "dom", label: "DOMINGO" },
];

export function createDefaultWeekSchedule(): WeekSchedule {
  const schedule: WeekSchedule = {};
  WEEK_DAYS.forEach((d) => {
    schedule[d.id] = { ativo: false, inicio: "18:00", fim: "02:00" };
  });
  return schedule;
}
