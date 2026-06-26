import { GenreOption } from "./types";

export const DS = {
  bg: "#09090F",
  accent: "#A78BFA",
  white: "#FFFFFF",
  textMuted: "#A0A0B8",
  textDis: "#888",
  primary: "#6C5CE7",
} as const;

export const GENRES: GenreOption[] = [
  { key: "Samba", icon: "music" },
  { key: "Forró", icon: "music" },
  { key: "Rock", icon: "guitar" },
  { key: "MPB", icon: "microphone" },
  { key: "Pop", icon: "star" },
  { key: "Eletrônica", icon: "bolt" },
  { key: "Sertanejo", icon: "hat-cowboy" },
  { key: "Jazz", icon: "music" },
  { key: "Blues", icon: "guitar" },
  { key: "Funk", icon: "headphones" },
];

export const MIN_GENRES = 2;
