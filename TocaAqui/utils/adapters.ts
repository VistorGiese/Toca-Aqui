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
