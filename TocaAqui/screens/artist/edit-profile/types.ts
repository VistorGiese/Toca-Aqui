export type ArtistEditProfileFieldKey =
  | "nome"
  | "bio"
  | "tipo"
  | "generos"
  | "instrumentos"
  | "experiencia"
  | "cacheMin"
  | "cacheMax"
  | "estado"
  | "cidade"
  | "estruturaSom";

export type ArtistEditProfileFieldErrors = Partial<Record<ArtistEditProfileFieldKey, string>>;

export type ArtistEditProfileTipoOption = {
  value: string;
  label: string;
};
