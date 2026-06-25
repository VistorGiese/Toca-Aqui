import { Candidatura } from "@/http/establishmentService";

export const DS = {
  bg: "#09090F",
  surface: "#161028",
  card: "#1E1635",
  border: "#2D2545",
  accent: "#7B61FF",
  cyan: "#00CEC9",
  danger: "#EF4444",
  success: "#00C853",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  amber: "#F59E0B",
} as const;

export const APPLICATION_TABS = [
  { id: "todas" as const, label: "Todas" },
  { id: "pendente" as const, label: "Não avaliadas" },
  { id: "favoritas" as const, label: "Favoritas" },
];

export const STATUS_LABEL: Record<Candidatura["status"], string> = {
  pendente: "Pendente",
  aceito: "Aceita",
  rejeitado: "Recusada",
};

export const DEFAULT_CLOSED_MESSAGE = "Evento fechado — candidatura já aceita.";
