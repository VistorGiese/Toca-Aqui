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

export const DELETE_ALERT = {
  title: "Excluir banda",
  message: "Tem certeza que deseja excluir esta banda? Esta ação não pode ser desfeita.",
  cancel: "Cancelar",
  confirm: "Excluir",
} as const;
