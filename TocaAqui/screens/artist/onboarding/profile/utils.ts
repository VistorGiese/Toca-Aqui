import { parseCacheInput, toggleListItem } from "@/screens/artist/edit-profile/utils";
import {
  OnboardingArtistProfileFieldErrors,
  OnboardingArtistProfileForm,
} from "./types";

export { toggleListItem };

export function validateOnboardingArtistProfile(
  form: OnboardingArtistProfileForm
): OnboardingArtistProfileFieldErrors {
  const next: OnboardingArtistProfileFieldErrors = {};

  if (!form.fotoUri) {
    next.foto = "Foto de perfil é obrigatória";
  }

  const nomeTrim = form.nomeArtistico.trim();
  if (!nomeTrim) {
    next.nomeArtistico = "Nome artístico é obrigatório";
  } else if (nomeTrim.length < 2) {
    next.nomeArtistico = "Nome artístico deve ter ao menos 2 caracteres";
  }

  if (!form.tipoSelecionado) {
    next.tipo = "Selecione o tipo de atuação";
  }

  if (form.generosSelecionados.length === 0) {
    next.generos = "Selecione ao menos um gênero musical";
  }

  const min = parseCacheInput(form.cacheMin);
  const max = parseCacheInput(form.cacheMax);
  if (min == null) {
    next.cacheMin = "Informe o cachê mínimo";
  } else if (min <= 0) {
    next.cacheMin = "O cachê mínimo deve ser maior que zero";
  }
  if (max == null) {
    next.cacheMax = "Informe o cachê máximo";
  } else if (max <= 0) {
    next.cacheMax = "O cachê máximo deve ser maior que zero";
  }
  if (min != null && max != null && min > max) {
    next.cacheMax = "O cachê máximo deve ser maior ou igual ao mínimo";
  }

  if (form.temEstrutura && form.estrutura.length === 0) {
    next.estrutura = "Selecione ao menos um equipamento";
  }

  return next;
}
