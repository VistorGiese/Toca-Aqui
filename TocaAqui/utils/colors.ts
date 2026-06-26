export const colors = {
  background: "#09090F",
  purpleBlack: "#0A0212",
  purpleBlack2: "#0F0B1E",

  purpleDark: "#28024E",
  purple: "#48216B",
  purplePrimary: "#7B61FF",
  purpleLight: "#A78BFA",
  purpleGlowBg: "rgba(123, 97, 255, 0.2)",
  purpleGlowBorder: "rgba(123, 97, 255, 0.35)",

  white: "#FFFFFF",
  textMuted: "#8888AA",
  textSubtle: "#8888AA",
  textSecondary: "#A0A0B8",
  textTertiary: "#555577",

  inputBorder: "#1E1A30",
  placeholder: "#3D3D5C",
  error: "#EF4444",

  neutral: "#6B7280",
  cyan: "#709D9B",
  green: "#6DB885",
  surface: "rgba(255, 255, 255, 0.04)",
  surfaceSoft: "rgba(255, 255, 255, 0.05)",
  surfaceBorder: "rgba(255, 255, 255, 0.06)",
  surfaceBorderStrong: "rgba(255, 255, 255, 0.08)",
  divider: "rgba(255, 255, 255, 0.06)",
  purplePrimarySoft: "rgba(108, 92, 231, 0.3)",
  accentSoftBg: "rgba(167, 139, 250, 0.15)",
  accentSoftFill: "rgba(167, 139, 250, 0.12)",
  accentBorderSoft: "rgba(167, 139, 250, 0.3)",
  iconOnSurface: "rgba(255, 255, 255, 0.3)",
  iconOnSurfaceMuted: "rgba(255, 255, 255, 0.4)",
  overlayDark: "rgba(0, 0, 0, 0.55)",
  overlayDarkSoft: "rgba(0, 0, 0, 0.5)",
  liveBadge: "rgba(255, 107, 107, 0.9)",
  priceFree: "#00C896",
  cardFallback: "#2D1B4E",
};

export const genreColors: Record<string, string> = {
  ROCK: "#A67C7C",
  SERTANEJO: "#C9A96E",
  ELETRÔNICA: "#00CEC9",
  MPB: "#27AE60",
  POP: "#FF69B4",
  JAZZ: "#6C3483",
  INDIE: "#A29BFE",
  BLUES: "#4A90D9",
  FUNK: "#F39C12",
  PAGODE: "#E67E22",
};

export function getGenreColor(genre: string): string {
  return genreColors[genre.toUpperCase()] ?? "#6C5CE7";
}

export function genreColorWithAlpha(genre: string, alpha = "44"): string {
  return `${getGenreColor(genre)}${alpha}`;
}
