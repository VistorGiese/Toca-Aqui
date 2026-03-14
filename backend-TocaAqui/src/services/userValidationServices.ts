
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
  if (!password || password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres";
  }
  return null;
};
