export const DS = {
  bg: "#09090F",
  card: "#1E1635",
  surface: "#161028",
  border: "#2D2545",
  accent: "#7B61FF",
  cyan: "#00CEC9",
  success: "#00C853",
  amber: "#F59E0B",
  error: "#E74C3C",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export type ScheduleFilter = "proximos" | "confirmados" | "abertos" | "passados";

export const SCHEDULE_FILTERS: { id: ScheduleFilter; label: string }[] = [
  { id: "proximos", label: "Próximos" },
  { id: "confirmados", label: "Confirmados" },
  { id: "abertos", label: "Abertos" },
  { id: "passados", label: "Passados" },
];
