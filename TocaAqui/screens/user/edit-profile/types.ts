export type UserEditProfileFieldKey =
  | "generos"
  | "cidade"
  | "estado";

export type UserEditProfileFieldErrors = Partial<Record<UserEditProfileFieldKey, string>>;

export type UserGenreOption = {
  key: string;
  icon: string;
};
