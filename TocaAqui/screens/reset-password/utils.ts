import { MIN_PASSWORD_LENGTH } from "./constants";

export function validateResetPassword(
  password: string,
  confirmPassword: string
): { password?: string; confirmPassword?: string } {
  const errors: { password?: string; confirmPassword?: string } = {};

  if (!password) {
    errors.password = "Informe a nova senha.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirme a nova senha.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  return errors;
}
