import { ApplyFormErrors } from "./types";

export function getFirstName(fullName?: string | null): string {
  if (!fullName?.trim()) return "artista";
  return fullName.trim().split(" ")[0];
}

export function validateApplyForm(
  mensagem: string,
  valorProposto: string
): { errors: ApplyFormErrors; valorNum?: number } {
  const errors: ApplyFormErrors = {};

  if (!mensagem.trim()) {
    errors.mensagem = "Mensagem de apresentação é obrigatória";
  }

  const valorNum = parseFloat(valorProposto);
  if (!valorProposto.trim() || isNaN(valorNum) || valorNum <= 0) {
    errors.valorProposto = "Valor proposto é obrigatório";
  }

  return { errors, valorNum: Object.keys(errors).length === 0 ? valorNum : undefined };
}

export function formatArtistLocation(cidade?: string, estado?: string): string {
  if (!cidade) return "";
  return estado ? `${cidade}, ${estado}` : cidade;
}

export function getApiErrorMessage(err: unknown): string {
  const response = (err as { response?: { data?: { error?: string; message?: string } } })
    ?.response?.data;
  return response?.error || response?.message || "Não foi possível enviar a candidatura.";
}
