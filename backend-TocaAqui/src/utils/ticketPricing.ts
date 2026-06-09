export function getTicketBaseUnitPrice(
  precoInteira: number | string | null | undefined,
  capacidadeMaxima: number | null | undefined,
): number {
  const base = Number(precoInteira ?? 0);
  if (!Number.isFinite(base) || base <= 0) return 0;

  const capacity = Number(capacidadeMaxima ?? 0);
  if (capacity > 0) {
    return Math.round((base / capacity) * 100) / 100;
  }
  return base;
}

export function getTicketHalfUnitPrice(
  precoInteira: number | string | null | undefined,
  precoMeia: number | string | null | undefined,
  capacidadeMaxima: number | null | undefined,
): number {
  if (precoMeia != null && Number(precoMeia) >= 0) {
    const meia = Number(precoMeia);
    const capacity = Number(capacidadeMaxima ?? 0);
    if (capacity > 0) return Math.round((meia / capacity) * 100) / 100;
    return meia;
  }

  const full = getTicketBaseUnitPrice(precoInteira, capacidadeMaxima);
  return Math.round((full / 2) * 100) / 100;
}
