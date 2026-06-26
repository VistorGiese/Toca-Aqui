import { genreColors } from "@/utils/colors";

export const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  accent: "#6C5CE7",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
} as const;

export const AVAILABLE_GENRES = Object.keys(genreColors);

export const MEMBER_SEARCH_DEBOUNCE_MS = 350;
export const MEMBER_SEARCH_MIN_LENGTH = 2;
