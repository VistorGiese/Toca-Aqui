import { parseCacheInput } from "@/screens/artist/edit-profile/utils";
import { OnboardingArtistBioFieldErrors, OnboardingArtistBioForm } from "./types";
import { BIO_MIN_LENGTH } from "./constants";
import { OnboardingArtistBioRouteParams } from "./types";

export function validateOnboardingArtistBio(
  form: OnboardingArtistBioForm
): OnboardingArtistBioFieldErrors {
  const next: OnboardingArtistBioFieldErrors = {};

  if (!form.estado) {
    next.estado = "Estado é obrigatório";
  }
  if (!form.cidade) {
    next.cidade = "Cidade é obrigatória";
  }

  const bioTrim = form.biografia.trim();
  if (!bioTrim) {
    next.biografia = "Biografia é obrigatória";
  } else if (bioTrim.length < BIO_MIN_LENGTH) {
    next.biografia = `Biografia deve ter ao menos ${BIO_MIN_LENGTH} caracteres`;
  }

  return next;
}

export function buildProfilePayload(
  params: OnboardingArtistBioRouteParams,
  cidadeNome: string,
  estadoSigla: string,
  biografia: string,
  links: string[]
) {
  const cacheMin = parseCacheInput(params.cacheMin);
  const cacheMax = parseCacheInput(params.cacheMax);

  return {
    nome_artistico: params.nome,
    tipo_atuacao: params.tipo,
    generos: params.generos,
    cache_minimo: cacheMin,
    cache_maximo: cacheMax,
    tem_estrutura_som: params.temEstrutura,
    estrutura_som: params.estrutura,
    cidade: cidadeNome,
    estado: estadoSigla,
    biografia: biografia.trim(),
    links_sociais: links,
  };
}

export function getApiErrorMessage(err: unknown): { title: string; message: string } {
  const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
  const msg =
    (data?.message as string) ||
    (data?.error as string) ||
    ((data?.detalhes as Array<{ mensagem?: string }>)?.[0]?.mensagem) ||
    ((data?.errors as Array<{ message?: string }>)?.[0]?.message) ||
    "Não foi possível salvar o perfil.";
  const detalhe =
    (data?.detalhes as Array<{ campo?: string; mensagem?: string }>)
      ?.map((d) => `${d.campo}: ${d.mensagem}`)
      .join("\n") || "";
  return {
    title: "Erro",
    message: detalhe ? `${msg}\n\n${detalhe}` : msg,
  };
}
