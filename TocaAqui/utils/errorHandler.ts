import { Alert } from "react-native";
import { isAxiosError } from "axios";

export type ApiValidationDetail = {
  campo: string;
  mensagem: string;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
  detalhes?: ApiValidationDetail[];
};

/** Extrai mensagem legível do formato da API (message, error ou detalhes Zod). */
export function getApiErrorMessage(error: unknown, fallback = "Erro desconhecido"): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  // Sem resposta HTTP (rede, timeout, servidor inacessível)
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "O servidor demorou demais para responder. Tente novamente.";
    }
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return "Não foi possível conectar ao servidor. Verifique a rede e se o backend está rodando.";
    }
    return error.message || fallback;
  }

  const data = error.response.data as ApiErrorBody | undefined;
  if (!data) return fallback;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  const detalhes = data.detalhes;
  if (Array.isArray(detalhes) && detalhes.length > 0) {
    return detalhes.map((d) => d.mensagem).filter(Boolean).join("\n");
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  return fallback;
}

export function getApiValidationDetails(error: unknown): ApiValidationDetail[] {
  if (!isAxiosError(error)) return [];
  const detalhes = (error.response?.data as ApiErrorBody | undefined)?.detalhes;
  return Array.isArray(detalhes) ? detalhes : [];
}

const CAMPO_PARA_CAMPO_FORM: Record<string, string> = {
  nome_completo: "nomeCompleto",
  email: "email",
  senha: "senha",
  tipo_usuario: "email",
};

/** Aplica erros de validação do backend nos campos do react-hook-form. */
export function applyApiFieldErrors(
  detalhes: ApiValidationDetail[],
  setError: (name: any, error: { type: string; message: string }) => void
): boolean {
  let applied = false;
  for (const item of detalhes) {
    const field = CAMPO_PARA_CAMPO_FORM[item.campo];
    if (field && item.mensagem) {
      setError(field, { type: "server", message: item.mensagem });
      applied = true;
    }
  }
  return applied;
}

export function showApiError(error: unknown, fallbackMessage: string): void {
  Alert.alert("Erro", getApiErrorMessage(error, fallbackMessage));
}
