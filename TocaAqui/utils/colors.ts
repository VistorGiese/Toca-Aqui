export const colors = {
  purpleBlack: "#0A0212",
  purpleBlack2: "#110022",
  purpleDark: "#28024E",
  purple: "#48216B",
  neutral: "#7381A8",
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
