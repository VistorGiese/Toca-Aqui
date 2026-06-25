export const DS = {
  bg: "#09090F",
  card: "#13101F",
  surface: "#0F0B1E",
  border: "#1E1A30",
  accent: "#7B61FF",
  success: "#00C853",
  danger: "#EF4444",
  gold: "#F6C90E",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const RATING_LABELS: Record<number, string> = {
  1: "EXPERIÊNCIA RUIM",
  2: "ABAIXO DA MÉDIA",
  3: "BOA PERFORMANCE",
  4: "MUITO BOA PERFORMANCE",
  5: "EXCELENTE PERFORMANCE",
};

export const HIGHLIGHT_CHIPS = [
  { label: "Pontual no sound check", positive: true },
  { label: "Profissional", positive: true },
  { label: "Ótima performance", positive: true },
  { label: "Público adorou", positive: true },
  { label: "Atrasou no show", positive: false },
  { label: "Não apareceu", positive: false },
] as const;

export const STAR_COUNT = 5;

export const COMMENT_PLACEHOLDER = "Descreva a experiência com este artista...";
