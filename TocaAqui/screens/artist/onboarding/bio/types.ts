import { RootStackParamList } from "@/navigation/Navigate";
import { RouteProp } from "@react-navigation/native";

export type OnboardingArtistBioRouteParams = RootStackParamList["OnboardingArtistBio"];

export type OnboardingArtistBioRoute = RouteProp<
  RootStackParamList,
  "OnboardingArtistBio"
>;

export interface IbgeEstado {
  sigla: string;
  nome: string;
}

export interface IbgeCidade {
  id: number;
  nome: string;
}

export type LocationPickerMode = "estado" | "cidade" | null;

export type OnboardingArtistBioFieldKey =
  | "estado"
  | "cidade"
  | "biografia"
  | "links"
  | "pressKit";

export type OnboardingArtistBioFieldErrors = Partial<
  Record<OnboardingArtistBioFieldKey, string>
>;

export interface OnboardingArtistBioForm {
  estado: IbgeEstado | null;
  cidade: IbgeCidade | null;
  biografia: string;
  links: string[];
  pressKit: string[];
}
