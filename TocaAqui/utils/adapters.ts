import { Platform } from "react-native";

// Resolve URLs de imagem relativas para URLs absolutas com base no servidor
const BASE_URL = "http://192.168.224.1:3000";

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}
