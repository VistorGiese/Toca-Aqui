export const colors = {
  // Fundos
  background: "#09090F",
  purpleBlack: "#0A0212",
  purpleBlack2: "#0F0B1E",

  // Roxos
  purpleDark: "#28024E",
  purple: "#48216B",
  purplePrimary: "#7B61FF",
  purpleLight: "#A78BFA",
  purpleGlowBg: "rgba(123, 97, 255, 0.2)",
  purpleGlowBorder: "rgba(123, 97, 255, 0.35)",

  // Textos
  white: "#FFFFFF",
  textMuted: "#8888AA",
  textSubtle: "#8888AA",

  // Inputs
  inputBorder: "#1E1A30",
  placeholder: "#3D3D5C",
  error: "#EF4444",

  // Outros
  neutral: "#6B7280",
  cyan: "#709D9B",
  green: "#6DB885",
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
