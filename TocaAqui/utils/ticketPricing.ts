export const TICKET_SERVICE_FEE_RATE = 0.1;

/** Preço unitário base: valor do ingresso ÷ capacidade (ou valor integral se sem capacidade). */
export function getTicketBaseUnitPrice(
  precoInteira: number | null | undefined,
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
  precoInteira: number | null | undefined,
  precoMeia: number | null | undefined,
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

/** Preço exibido "a partir de": unitário + 10% de taxa. */
export function getTicketDisplayPriceWithFee(
  precoInteira: number | null | undefined,
  capacidadeMaxima: number | null | undefined,
): number {
  const unit = getTicketBaseUnitPrice(precoInteira, capacidadeMaxima);
  if (unit <= 0) return 0;
  return Math.round(unit * (1 + TICKET_SERVICE_FEE_RATE) * 100) / 100;
}

export function calcCheckoutTotals(
  qtyFull: number,
  priceFull: number,
  qtyHalf: number,
  priceHalf: number,
  isFree: boolean,
) {
  const subtotal = qtyFull * priceFull + qtyHalf * priceHalf;
  const serviceFee = isFree
    ? 0
    : Math.round(subtotal * TICKET_SERVICE_FEE_RATE * 100) / 100;
  const total = subtotal + serviceFee;
  return { subtotal, serviceFee, total };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
