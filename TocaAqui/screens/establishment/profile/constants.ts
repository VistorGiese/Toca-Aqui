import { Dimensions } from "react-native";

export const COVER_HEIGHT = 240;
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const PHOTO_SIZE = (SCREEN_WIDTH - 20 * 2 - 8 * 2) / 3;

export const DS = {
  bg: "#09090F",
  surface: "#0F0B1E",
  card: "#13101F",
  border: "#1E1A30",
  accent: "#7B61FF",
  cyan: "#00CEC9",
  green: "#00C853",
  yellow: "#F39C12",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const TIPO_LABEL: Record<string, string> = {
  bar: "BAR & MUSIC VENUE",
  casa_show: "CASA DE SHOW",
  restaurante: "RESTAURANTE",
  club: "CLUB",
  outro: "ESPAÇO CULTURAL",
};

export const DEFAULT_TIPO_LABEL = "ESPAÇO CULTURAL";
export const DEFAULT_PROFILE_NAME = "Meu Estabelecimento";
