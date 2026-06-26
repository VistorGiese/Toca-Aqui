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
  gold: "#F6C90E",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
} as const;

export const TIPO_ATUACAO_LABEL: Record<string, string> = {
  Solo: "ARTISTA SOLO",
  Duo: "DUO",
  Banda: "BANDA",
  DJ: "DJ",
  solo: "ARTISTA SOLO",
  banda: "BANDA",
  duo: "DUO",
  trio: "TRIO",
};

export const DEFAULT_TIPO_LABEL = "ARTISTA";
export const DEFAULT_PROFILE_NAME = "Artista";
