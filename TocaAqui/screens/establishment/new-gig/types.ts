export type EstNewGigSaleMode = "antecipada" | "na_porta";

export type EstNewGigFieldKey =
  | "titulo"
  | "data"
  | "inicio"
  | "fim"
  | "generos"
  | "capacidade";

export type EstNewGigFieldErrors = Partial<Record<EstNewGigFieldKey, string>>;
