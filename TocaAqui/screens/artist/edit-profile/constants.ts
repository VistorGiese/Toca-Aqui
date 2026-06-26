import { ArtistEditProfileTipoOption } from "./types";

export const DS = {
  bg: "#09090F",
  card: "#13101F",
  border: "#1E1A30",
  accent: "#7B61FF",
  textPrimary: "#FFFFFF",
  textSecondary: "#8888AA",
  textMuted: "#555577",
  danger: "#EF4444",
} as const;

export const ARTIST_EDIT_PROFILE_TIPOS: ArtistEditProfileTipoOption[] = [
  { value: "Solo", label: "Solo" },
  { value: "Duo", label: "Duo" },
  { value: "Banda", label: "Banda" },
  { value: "DJ", label: "DJ" },
];

export {
  GENEROS_OPCOES,
  INSTRUMENTOS_OPCOES,
  EQUIPAMENTOS_OPCOES,
} from "@/constants/artistProfileOptions";
