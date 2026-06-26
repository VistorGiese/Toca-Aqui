export function getTicketBaseUnitPrice(
  precoInteira: number | null | undefined,
  _capacidadeMaxima?: number | null | undefined,
): number {
  const base = Number(precoInteira ?? 0);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return Math.round(base * 100) / 100;
}

export function getTicketHalfUnitPrice(
  precoInteira: number | null | undefined,
  precoMeia: number | null | undefined,
  _capacidadeMaxima?: number | null | undefined,
): number {
  if (precoMeia != null && Number(precoMeia) >= 0) {
    return Math.round(Number(precoMeia) * 100) / 100;
  }

  const full = getTicketBaseUnitPrice(precoInteira);
  return Math.round((full / 2) * 100) / 100;
}

export function getTicketDisplayPrice(
  precoInteira: number | null | undefined,
  _capacidadeMaxima?: number | null | undefined,
): number {
  return getTicketBaseUnitPrice(precoInteira);
}

export function calcCheckoutTotals(
  qtyFull: number,
  priceFull: number,
  qtyHalf: number,
  priceHalf: number,
) {
  const subtotal = qtyFull * priceFull + qtyHalf * priceHalf;
  return { subtotal, total: subtotal };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
