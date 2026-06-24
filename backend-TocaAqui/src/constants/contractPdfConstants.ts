/**
 * Limite por campo TEXT/MEDIUMTEXT usado para chunks de PDF em base64.
 * Alinhado ao body parser (10 MB) — um chunk por requisição PUT.
 */
export const PDF_TEXT_FIELD_MAX = 4_500_000;

/** Prefixos que identificam conteúdo de armazenamento PDF/workflow (não texto legível). */
export const PDF_STORAGE_PREFIXES = ['__B64__', '__WF__', '__PDF_'] as const;
