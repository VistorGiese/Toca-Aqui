export const DS = {
  bg: "#09090F",
  card: "#1A1040",
  surface: "#13101F",
  border: "#2D2545",
  accent: "#6C5CE7",
  cyan: "#00CEC9",
  success: "#00C853",
  amber: "#F59E0B",
  error: "#E74C3C",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B8",
  textMuted: "#555577",
} as const;

export const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

export type ScheduleFilter = "proximos" | "confirmados" | "pendentes" | "passados";

export const SCHEDULE_FILTERS: { id: ScheduleFilter; label: string }[] = [
  { id: "proximos", label: "Próximos" },
  { id: "confirmados", label: "Confirmados" },
  { id: "pendentes", label: "Pendentes" },
  { id: "passados", label: "Passados" },
];
