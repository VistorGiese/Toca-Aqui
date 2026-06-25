import { Dimensions } from "react-native";

export const COVER_HEIGHT = 200;
export const SCREEN_WIDTH = Dimensions.get("window").width;

export const DS = {
  bg: "#09090F",
  surface: "#161028",
  accent: "#A78BFA",
  accentSolid: "#6C5CE7",
  border: "#1A1040",
  gold: "#FFD700",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B8",
  textMuted: "#555577",
} as const;

export const TIPO_LABEL: Record<string, string> = {
  bar: "BAR & MUSIC VENUE",
  casa_show: "CASA DE SHOW",
  restaurante: "RESTAURANTE",
  club: "CLUB",
  outro: "ESPAÇO CULTURAL",
};

export const DEFAULT_GENRE_LABEL = "LOCAL";
export const MONTH_ABBR = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;
