import { EMAIL_REGEX } from "./constants";

export function validateForgotPasswordEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return "Informe seu e-mail.";
  if (!EMAIL_REGEX.test(trimmed)) return "E-mail inválido.";
  return undefined;
}
