import { getApiBaseUrl } from "@/http/api";

/**
 * Resolve URLs de imagem relativas para absolutas usando a mesma base da API.
 * Imagens e API sempre apontam para o mesmo servidor.
 */
export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

export function parsePressKit(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Monta arquivo para FormData com MIME válido para o backend (multer). */
export function buildImageFormFile(uri: string, fallbackName: string): {
  uri: string;
  name: string;
  type: string;
} {
  const rawName = uri.split("/").pop() || fallbackName;
  const extMatch = /\.(\w+)$/.exec(rawName);
  const ext = extMatch?.[1]?.toLowerCase() || "jpg";
  const safeExt = ext === "jpeg" ? "jpg" : ext;
  const mime =
    safeExt === "jpg" ? "image/jpeg"
    : safeExt === "png" ? "image/png"
    : safeExt === "webp" ? "image/webp"
    : "image/jpeg";
  const name = extMatch ? rawName : `${fallbackName.replace(/\.\w+$/, "")}.${safeExt}`;
  return { uri, name, type: mime };
}
