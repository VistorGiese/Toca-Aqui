import { Ingresso } from "@/http/ingressoService";

const MONTHS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
] as const;

export function formatDate(dataShow: string): string {
  const date = new Date(dataShow);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function getStatusLabel(status: Ingresso["status"]): string {
  switch (status) {
    case "confirmado":
      return "CONFIRMADO";
    case "utilizado":
      return "UTILIZADO";
    case "cancelado":
      return "CANCELADO";
    case "pendente":
      return "PENDENTE";
    default:
      return status.toUpperCase();
  }
}

export function getStatusColor(status: Ingresso["status"]): string {
  switch (status) {
    case "confirmado":
      return "#00C896";
    case "utilizado":
      return "#A78BFA";
    case "cancelado":
      return "#FF6B6B";
    case "pendente":
      return "#F59E0B";
    default:
      return "#A0A0B8";
  }
}
