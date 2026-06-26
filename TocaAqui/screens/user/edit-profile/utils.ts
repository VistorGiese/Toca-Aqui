export function parseCidadePref(cidade?: string): {
  cidadeNome: string;
  estadoSigla: string;
} {
  if (!cidade?.trim()) return { cidadeNome: "", estadoSigla: "" };

  const parts = cidade.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const estadoSigla = parts[parts.length - 1];
    const cidadeNome = parts.slice(0, -1).join(", ");
    return { cidadeNome, estadoSigla };
  }

  return { cidadeNome: cidade.trim(), estadoSigla: "" };
}

export function formatCidadePref(cidadeNome: string, estadoSigla: string): string {
  const nome = cidadeNome.trim();
  if (!nome) return "";
  const uf = estadoSigla.trim();
  return uf ? `${nome}, ${uf}` : nome;
}

export function resolveCidadeToSave(
  cidadeTexto: string,
  cidadeIbge: string,
  estadoSigla: string
): string {
  const texto = cidadeTexto.trim();
  if (texto) return texto;
  return formatCidadePref(cidadeIbge, estadoSigla);
}
