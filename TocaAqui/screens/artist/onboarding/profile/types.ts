export type OnboardingArtistProfileFieldKey =
  | "foto"
  | "nomeArtistico"
  | "tipo"
  | "generos"
  | "cacheMin"
  | "cacheMax"
  | "estrutura";

export type OnboardingArtistProfileFieldErrors = Partial<
  Record<OnboardingArtistProfileFieldKey, string>
>;

export type TipoAtuacao = "Solo" | "Duo" | "Banda" | "DJ";

export interface OnboardingArtistProfileForm {
  fotoUri: string | null;
  nomeArtistico: string;
  tipoSelecionado: TipoAtuacao | null;
  generosSelecionados: string[];
  cacheMin: string;
  cacheMax: string;
  temEstrutura: boolean;
  estrutura: string[];
}
