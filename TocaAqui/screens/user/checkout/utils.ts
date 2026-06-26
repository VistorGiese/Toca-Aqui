import { sanitizeDigits } from "@/utils/documentValidation";
import { formatCpf } from "@/utils/inputMasks";
import { CheckoutFormData, PayMethod } from "./types";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          detalhes?: Array<{ mensagem?: string; message?: string }>;
          errors?: Array<{ message?: string }>;
        };
      };
    }).response?.data;
    if (data?.message) return data.message;
    if (data?.detalhes?.[0]?.mensagem) return data.detalhes[0].mensagem;
    if (data?.detalhes?.[0]?.message) return data.detalhes[0].message;
    if (data?.errors?.[0]?.message) return data.errors[0].message;
    if (data?.error) return data.error;
  }
  return fallback;
}

export function changeTicketQty(
  type: "full" | "half",
  delta: number,
  qtyFull: number,
  qtyHalf: number,
  maxTotal: number,
): { qtyFull: number; qtyHalf: number } | null {
  if (type === "full") {
    const next = qtyFull + delta;
    if (next >= 0 && next + qtyHalf <= maxTotal) {
      return { qtyFull: next, qtyHalf };
    }
  } else {
    const next = qtyHalf + delta;
    if (next >= 0 && next + qtyFull <= maxTotal) {
      return { qtyFull, qtyHalf: next };
    }
  }
  return null;
}

export function validateCardExpiry(value: string): string | undefined {
  const digits = sanitizeDigits(value);
  if (digits.length !== 4) return "Validade inválida";

  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return "Mês inválido";

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Cartão expirado";
  }

  return undefined;
}

export function validateCardNumber(value: string): string | undefined {
  const digits = sanitizeDigits(value);
  if (digits.length < 16) return "Número do cartão incompleto";
  return undefined;
}

export function validateCardCvv(value: string): string | undefined {
  const digits = sanitizeDigits(value);
  if (digits.length < 3) return "CVV inválido";
  return undefined;
}

export function buildCardValidators(isFree: boolean, payMethod: PayMethod) {
  const required = !isFree && payMethod === "card";

  return {
    cardNumber: (value: string) => {
      if (!required) return true;
      return validateCardNumber(value) ?? true;
    },
    cardExpiry: (value: string) => {
      if (!required) return true;
      return validateCardExpiry(value) ?? true;
    },
    cardCvv: (value: string) => {
      if (!required) return true;
      return validateCardCvv(value) ?? true;
    },
  };
}

export function buildCheckoutPayload(data: CheckoutFormData, showId: number) {
  return {
    agendamento_id: showId,
    nome_comprador: data.nome.trim(),
    cpf: formatCpf(data.cpf),
    telefone: data.telefone.trim() || undefined,
  };
}
