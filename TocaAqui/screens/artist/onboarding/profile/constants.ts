import { TipoAtuacao } from "./types";

export const DS = {
  bg: "#09090F",
  bgCard: "#16163A",
  bgInput: "#1E1250",
  accent: "#6C5CE7",
  accentLight: "#8B7CF8",
  cyan: "#4ECDC4",
  white: "#FFFFFF",
  textSec: "#A0A0B8",
  textDis: "#555577",
  danger: "#E53E3E",
  bgSurface: "#1A1040",
} as const;

export const PROGRESS_PERCENT = "33%";
export const STEP_LABEL = "01 / 03";

export const TIPOS_ATUACAO: TipoAtuacao[] = ["Solo", "Duo", "Banda", "DJ"];

export {
  GENEROS_OPCOES,
  EQUIPAMENTOS_OPCOES,
} from "@/constants/artistProfileOptions";
