
export const validateEmailFormat = (email: string): string | null => {
  if (!email || email.trim() === "") {
    return "Digite um e-mail válido (ex: nome@email.com)";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Digite um e-mail válido (ex: nome@email.com)";
  }
  return null;
};

export const validatePasswordFormat = (password: string): string | null => {
  const senhaRegex =
    /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!password || !senhaRegex.test(password)) {
    return "A senha deve ter no mínimo 8 caracteres e pelo menos 1 caractere especial";
  }
  return null;
};
