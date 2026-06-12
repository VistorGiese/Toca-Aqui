export function getTicketBaseUnitPrice(
  precoInteira: number | string | null | undefined,
  _capacidadeMaxima?: number | null | undefined,
): number {
  const base = Number(precoInteira ?? 0);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return Math.round(base * 100) / 100;
}

export function getTicketHalfUnitPrice(
  precoInteira: number | string | null | undefined,
  precoMeia: number | string | null | undefined,
  _capacidadeMaxima?: number | null | undefined,
): number {
  if (precoMeia != null && Number(precoMeia) >= 0) {
    return Math.round(Number(precoMeia) * 100) / 100;
  }

  const full = getTicketBaseUnitPrice(precoInteira);
  return Math.round((full / 2) * 100) / 100;
}
