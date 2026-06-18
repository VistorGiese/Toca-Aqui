export function parseGenres(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.toUpperCase());
}

