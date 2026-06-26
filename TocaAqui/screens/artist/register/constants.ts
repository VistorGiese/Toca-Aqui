import { RegisterOptions } from "react-hook-form";
import { RegisterArtistFormData } from "./types";

export const DS = {
  bg: "#09090F",
  white: "#FFFFFF",
  cyan: "#4ECDC4",
  textSec: "#A0A0B8",
} as const;

export const SCROLL_TOP_RATIO = 0.15;

export const SUCCESS_ALERT = {
  title: "Conta criada!",
  message: "Verifique seu e-mail para ativar a conta antes de fazer login.",
  button: "Ir para login",
} as const;

export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const FORM_RULES: {
  nomeCompleto: RegisterOptions<RegisterArtistFormData, "nomeCompleto">["rules"];
  email: RegisterOptions<RegisterArtistFormData, "email">["rules"];
  senha: RegisterOptions<RegisterArtistFormData, "senha">["rules"];
} = {
  nomeCompleto: {
    required: "Nome completo é obrigatório",
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
  },
  email: {
    required: "E-mail é obrigatório",
    pattern: {
      value: EMAIL_PATTERN,
      message: "E-mail inválido",
    },
  },
  senha: {
    required: "Senha é obrigatória",
    minLength: {
      value: 8,
      message: "A senha deve ter no mínimo 8 caracteres",
    },
    pattern: {
      value: PASSWORD_PATTERN,
      message: "Use letras maiúsculas, minúsculas e números",
    },
  },
};
