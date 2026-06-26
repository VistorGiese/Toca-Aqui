export function buildRefNumber(contractId: number): string {
  return `SE-2026-${String(contractId).padStart(4, "0")}-GIG`;
}

export function formatContractDate(date?: string): string {
  if (!date) return "Data não informada";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
