import { Dimensions } from "react-native";

export const COVER_HEIGHT = 220;
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_TOP_PADDING = 60;

export const DS = {
  bg: "#09090F",
  card: "#16163A",
  surface: "#1A1040",
  border: "#2D2545",
  accent: "#A78BFA",
  accentSolid: "#6C5CE7",
  success: "#10B981",
  amber: "#F59E0B",
  gold: "#FFD700",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B8",
  textMuted: "#555577",
} as const;

export const DEFAULT_ARTIST_NAME = "Artista";
export const MONTH_ABBR = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
] as const;
