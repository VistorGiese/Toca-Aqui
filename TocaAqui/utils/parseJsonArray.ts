export function parseJsonArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === "string" && item.length > 0) return [item];
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        if (typeof obj.nome === "string" && obj.nome.length > 0) return [obj.nome];
        if (typeof obj.name === "string" && obj.name.length > 0) return [obj.name];
      }
      return [];
    });
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
      }
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}
