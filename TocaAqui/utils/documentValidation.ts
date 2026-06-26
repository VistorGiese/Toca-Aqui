export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function sanitizeCpf(value: string): string {
  return sanitizeDigits(value).slice(0, 11);
}

export function sanitizeCnpj(value: string): string {
  return sanitizeDigits(value).slice(0, 14);
}

function allSameDigits(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function calcCpfCheckDigit(digits: string, factor: number): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * (factor - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = sanitizeCpf(value);
  if (digits.length !== 11 || allSameDigits(digits)) return false;

  const d1 = calcCpfCheckDigit(digits.slice(0, 9), 10);
  const d2 = calcCpfCheckDigit(digits.slice(0, 10), 11);
  return digits.endsWith(`${d1}${d2}`);
}

function calcCnpjCheckDigit(digits: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const digits = sanitizeCnpj(value);
  if (digits.length !== 14 || allSameDigits(digits)) return false;

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calcCnpjCheckDigit(digits, w1);
  const d2 = calcCnpjCheckDigit(`${digits.slice(0, 12)}${d1}`, w2);
  return digits.endsWith(`${d1}${d2}`);
}

export function validateCpfField(value: string): string | undefined {
  const digits = sanitizeCpf(value);
  if (!digits) return "CPF é obrigatório";
  if (digits.length !== 11) return "CPF incompleto";
  if (!isValidCpf(digits)) return "CPF inválido";
  return undefined;
}

export function validateCnpjField(value: string, optional = false): string | undefined {
  const digits = sanitizeCnpj(value);
  if (!digits) return optional ? undefined : "CNPJ é obrigatório";
  if (digits.length !== 14) return "CNPJ incompleto (14 dígitos)";
  if (!isValidCnpj(digits)) return "CNPJ inválido";
  return undefined;
}

export function validatePhoneField(value: string, required = false): string | undefined {
  const digits = sanitizeDigits(value);
  if (!digits) return required ? "Telefone é obrigatório" : undefined;
  if (digits.length < 10) return "Telefone incompleto";
  return undefined;
}
