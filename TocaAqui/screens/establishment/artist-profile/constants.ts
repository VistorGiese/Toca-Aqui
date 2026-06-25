import { Dimensions } from "react-native";

export const COVER_HEIGHT = 220;
export const SCREEN_WIDTH = Dimensions.get("window").width;

export const DS = {
  bg: "#09090F",
  card: "#13101F",
  surface: "#0F0B1E",
  border: "#1E1A30",
  accent: "#7B61FF",
  cyan: "#00CEC9",
  success: "#00C853",
  amber: "#F59E0B",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const DEFAULT_ARTIST_NAME = "Artista";
export const DEFAULT_BAND_NAME = "Banda";
